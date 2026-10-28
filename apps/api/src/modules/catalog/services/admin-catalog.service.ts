import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchService } from './elasticsearch.service';
import { OutboxService } from '../../outbox/outbox.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { DOMAIN_EVENTS } from '../../queues/queue.constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
    private readonly outbox: OutboxService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
    }

    const existingSku = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new BadRequestException(`Product with SKU ${dto.sku} already exists`);
    }

    const product = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          sku: dto.sku,
          categoryId: dto.categoryId,
          titleBn: dto.titleBn,
          titleEn: dto.titleEn,
          descriptionBn: dto.descriptionBn,
          descriptionEn: dto.descriptionEn,
          sourcingPriceCny: new Prisma.Decimal(dto.sourcingPriceCny),
          retailPriceBdt: new Prisma.Decimal(dto.retailPriceBdt),
          dealerPriceBdt: dto.dealerPriceBdt ? new Prisma.Decimal(dto.dealerPriceBdt) : null,
          moq: dto.moq ?? 1,
          singlePieceAvailable: dto.singlePieceAvailable ?? true,
          avgShippingRatePerKgBdt: new Prisma.Decimal(dto.avgShippingRatePerKgBdt),
          warrantyMonths: dto.warrantyMonths ?? 0,
          isGenuineCertified: dto.isGenuineCertified ?? false,
          estimatedWeightGrams: dto.estimatedWeightGrams,
          isActive: true,
          variants: dto.variants?.length
            ? {
                create: dto.variants.map((v) => ({
                  name: v.name,
                  skuSuffix: v.skuSuffix,
                  priceAdjustmentBdt: new Prisma.Decimal(v.priceAdjustmentBdt ?? 0),
                  stock: v.stock,
                })),
              }
            : undefined,
          media: dto.media?.length
            ? {
                create: dto.media.map((m) => ({
                  url: m.url,
                  mediaType: m.mediaType,
                  sortOrder: m.sortOrder ?? 0,
                  altText: m.altText,
                })),
              }
            : undefined,
        },
        include: {
          variants: true,
          media: true,
          category: true,
        },
      });

      // Write outbox event for async indexing
      await this.outbox.createEvent(
        {
          eventType: DOMAIN_EVENTS.PRODUCT_INDEX_REQUIRED,
          aggregateType: 'Product',
          aggregateId: created.id,
          payload: { action: 'index', productId: created.id },
        },
        tx,
      );

      return created;
    });

    // Also attempt synchronous ES update
    await this.elasticsearch.indexProduct(product);

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        titleBn: dto.titleBn,
        titleEn: dto.titleEn,
        descriptionBn: dto.descriptionBn,
        descriptionEn: dto.descriptionEn,
        retailPriceBdt:
          dto.retailPriceBdt !== undefined ? new Prisma.Decimal(dto.retailPriceBdt) : undefined,
        sourcingPriceCny:
          dto.sourcingPriceCny !== undefined ? new Prisma.Decimal(dto.sourcingPriceCny) : undefined,
        dealerPriceBdt:
          dto.dealerPriceBdt !== undefined ? new Prisma.Decimal(dto.dealerPriceBdt) : undefined,
        moq: dto.moq,
        singlePieceAvailable: dto.singlePieceAvailable,
        avgShippingRatePerKgBdt:
          dto.avgShippingRatePerKgBdt !== undefined
            ? new Prisma.Decimal(dto.avgShippingRatePerKgBdt)
            : undefined,
        warrantyMonths: dto.warrantyMonths,
        isGenuineCertified: dto.isGenuineCertified,
        estimatedWeightGrams: dto.estimatedWeightGrams,
        isActive: dto.isActive,
      },
      include: {
        variants: true,
        media: true,
        category: true,
      },
    });

    await this.elasticsearch.indexProduct(updated);
    return updated;
  }

  async deleteProduct(id: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    await this.elasticsearch.deleteProduct(id);
    return { success: true, message: `Product ${id} deleted` };
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException(`Category with slug ${dto.slug} already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent category ${dto.parentId} not found`);
      }
    }

    return this.prisma.category.create({
      data: {
        slug: dto.slug,
        nameBn: dto.nameBn,
        nameEn: dto.nameEn,
        parentId: dto.parentId,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async fullReindex(): Promise<{ enqueued: number }> {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      select: {
        id: true,
        sku: true,
        titleBn: true,
        titleEn: true,
        descriptionBn: true,
        descriptionEn: true,
        retailPriceBdt: true,
        categoryId: true,
        isActive: true,
      },
    });

    let indexedCount = 0;
    for (const p of products) {
      const ok = await this.elasticsearch.indexProduct(p);
      if (ok) indexedCount++;
    }

    return { enqueued: indexedCount };
  }
}
