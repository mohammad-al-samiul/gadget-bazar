import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchService } from './elasticsearch.service';
import { ProductFilterDto, ProductSortOption } from '../dto/product-filter.dto';
import { toPublicProductResponse, PublicProductResponse } from '../dto/public-product.dto';
import { Prisma } from '@prisma/client';

export interface PaginatedProductsResponse {
  items: PublicProductResponse[];
  nextCursor: string | null;
  hasMore: boolean;
  count: number;
}

export interface ComparisonMatrix {
  products: PublicProductResponse[];
  attributes: Array<{
    name: string;
    labelBn: string;
    labelEn: string;
    values: Record<string, string | number | boolean>;
  }>;
}

export interface BundleSuggestion {
  bundleId: string;
  titleBn: string;
  titleEn: string;
  primaryProduct: PublicProductResponse;
  bundledItems: PublicProductResponse[];
  individualTotalBdt: number;
  bundlePriceBdt: number;
  discountPercentage: number;
  savingsBdt: number;
}

// Explicit Prisma public select that NEVER includes sourcingPriceCny
const PUBLIC_PRODUCT_SELECT = {
  id: true,
  sku: true,
  categoryId: true,
  titleBn: true,
  titleEn: true,
  descriptionBn: true,
  descriptionEn: true,
  retailPriceBdt: true,
  dealerPriceBdt: true,
  moq: true,
  singlePieceAvailable: true,
  avgShippingRatePerKgBdt: true,
  warrantyMonths: true,
  isGenuineCertified: true,
  estimatedWeightGrams: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      slug: true,
      nameBn: true,
      nameEn: true,
      imageUrl: true,
    },
  },
  variants: {
    select: {
      id: true,
      name: true,
      skuSuffix: true,
      priceAdjustmentBdt: true,
      stock: true,
    },
  },
  media: {
    select: {
      id: true,
      url: true,
      mediaType: true,
      sortOrder: true,
      altText: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
};

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  /**
   * Returns 2-level category hierarchy: parent categories with nested subcategories.
   */
  async getCategories() {
    const rootCategories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { nameEn: 'asc' },
        },
      },
      orderBy: { nameEn: 'asc' },
    });

    return rootCategories.map((parent) => ({
      id: parent.id,
      slug: parent.slug,
      nameBn: parent.nameBn,
      nameEn: parent.nameEn,
      imageUrl: parent.imageUrl,
      children: parent.children.map((child) => ({
        id: child.id,
        slug: child.slug,
        nameBn: child.nameBn,
        nameEn: child.nameEn,
        imageUrl: child.imageUrl,
      })),
    }));
  }

  /**
   * Public product listing with cursor-based pagination, multi-criteria filtering, and sorting.
   */
  async getProducts(filters: ProductFilterDto): Promise<PaginatedProductsResponse> {
    const limit = filters.limit || 20;
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
    };

    // Category filter: match category or any of its subcategories
    if (filters.category) {
      const category = await this.prisma.category.findFirst({
        where: {
          OR: [{ slug: filters.category }, { id: filters.category }],
        },
        include: { children: { select: { id: true } } },
      });

      if (category) {
        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    // Price filters
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.retailPriceBdt = {};
      if (filters.priceMin !== undefined) {
        where.retailPriceBdt.gte = new Prisma.Decimal(filters.priceMin);
      }
      if (filters.priceMax !== undefined) {
        where.retailPriceBdt.lte = new Prisma.Decimal(filters.priceMax);
      }
    }

    // Single piece filter
    if (filters.singlePiece !== undefined) {
      where.singlePieceAvailable = filters.singlePiece;
    }

    // In-stock filter
    if (filters.inStock) {
      where.variants = {
        some: {
          stock: { gt: 0 },
        },
      };
    }

    // Sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (filters.sort) {
      case ProductSortOption.PRICE_ASC:
        orderBy = { retailPriceBdt: 'asc' };
        break;
      case ProductSortOption.PRICE_DESC:
        orderBy = { retailPriceBdt: 'desc' };
        break;
      case ProductSortOption.POPULAR:
        orderBy = { reviews: { _count: 'desc' } };
        break;
      case ProductSortOption.NEWEST:
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Cursor pagination (fetch limit + 1 to detect hasMore)
    const findArgs: any = {
      where,
      select: PUBLIC_PRODUCT_SELECT,
      orderBy,
      take: limit + 1,
    };

    if (filters.cursor) {
      findArgs.skip = 1;
      findArgs.cursor = { id: Buffer.from(filters.cursor, 'base64').toString('ascii') };
    }

    const products = await this.prisma.product.findMany(findArgs);

    const hasMore = products.length > limit;
    const items = hasMore ? products.slice(0, limit) : products;
    const lastItem = items.length > 0 ? items[items.length - 1] : undefined;
    const nextCursor = hasMore && lastItem ? Buffer.from(lastItem.id).toString('base64') : null;

    return {
      items: items.map(toPublicProductResponse),
      nextCursor,
      hasMore,
      count: items.length,
    };
  }

  async getProductByIdOrSku(idOrSku: string): Promise<PublicProductResponse> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSku }, { sku: idOrSku }],
        deletedAt: null,
        isActive: true,
      },
      select: PUBLIC_PRODUCT_SELECT,
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    return toPublicProductResponse(product);
  }

  /**
   * Full text search with typo tolerance and automatic graceful DB fallback
   */
  async searchProducts(query: string, limit = 20): Promise<PublicProductResponse[]> {
    if (!query || !query.trim()) {
      const listing = await this.getProducts({ limit });
      return listing.items;
    }

    // 1. Try Elasticsearch
    const esResult = await this.elasticsearch.search(query.trim(), limit);

    if (esResult && esResult.productIds.length > 0) {
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: esResult.productIds },
          deletedAt: null,
          isActive: true,
        },
        select: PUBLIC_PRODUCT_SELECT,
      });

      // Preserve Elasticsearch relevance ranking order
      const productMap = new Map(products.map((p) => [p.id, p]));
      const ordered = esResult.productIds.map((id) => productMap.get(id)).filter(Boolean);

      return ordered.map(toPublicProductResponse);
    }

    // 2. Resilient Degraded Fallback: PostgreSQL ILIKE search
    const dbFallbackProducts = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { titleBn: { contains: query, mode: 'insensitive' } },
          { titleEn: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { descriptionBn: { contains: query, mode: 'insensitive' } },
          { descriptionEn: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: PUBLIC_PRODUCT_SELECT,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return dbFallbackProducts.map(toPublicProductResponse);
  }

  /**
   * Compares 2 to 4 products across common specs and heterogeneous fields.
   */
  async compareProducts(productIds: string[]): Promise<ComparisonMatrix> {
    const uniqueIds = Array.from(new Set(productIds));
    if (uniqueIds.length < 2 || uniqueIds.length > 4) {
      throw new BadRequestException('Product comparison requires between 2 and 4 products');
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: uniqueIds },
        deletedAt: null,
        isActive: true,
      },
      select: PUBLIC_PRODUCT_SELECT,
    });

    if (products.length < 2) {
      throw new BadRequestException('At least 2 valid active products are required to compare');
    }

    const publicProducts = products.map(toPublicProductResponse);

    // Build attribute comparison table
    const attributes = [
      {
        name: 'retailPrice',
        labelBn: 'মূল্য (টাকা)',
        labelEn: 'Retail Price (BDT)',
        values: Object.fromEntries(
          publicProducts.map((p) => [p.id, `৳${p.retailPriceBdt.toLocaleString()}`]),
        ),
      },
      {
        name: 'singlePieceAvailable',
        labelBn: 'খুচরা ১ পিস পাওয়া যাবে?',
        labelEn: 'Single Piece Available',
        values: Object.fromEntries(
          publicProducts.map((p) => [
            p.id,
            p.singlePieceAvailable ? 'হ্যাঁ (Yes)' : 'না (No - MOQ only)',
          ]),
        ),
      },
      {
        name: 'moq',
        labelBn: 'সর্বনিম্ন অর্ডার (MOQ)',
        labelEn: 'Minimum Order Quantity',
        values: Object.fromEntries(publicProducts.map((p) => [p.id, `${p.moq} pcs`])),
      },
      {
        name: 'warrantyMonths',
        labelBn: 'ওয়ারেন্টি',
        labelEn: 'Warranty Period',
        values: Object.fromEntries(
          publicProducts.map((p) => [
            p.id,
            p.warrantyMonths > 0
              ? `${p.warrantyMonths} মাস (${p.warrantyMonths} mo)`
              : 'ওয়ারেন্টি প্রযোজ্য নয়',
          ]),
        ),
      },
      {
        name: 'weightGrams',
        labelBn: 'আনুমানিক ওজন',
        labelEn: 'Estimated Weight',
        values: Object.fromEntries(
          publicProducts.map((p) => [
            p.id,
            `${p.estimatedWeightGrams} গ্রাম (${(p.estimatedWeightGrams / 1000).toFixed(2)} kg)`,
          ]),
        ),
      },
      {
        name: 'shippingRateEstimate',
        labelBn: 'শিপিং রেট (আনুমানিক)',
        labelEn: 'Estimated Shipping Rate',
        values: Object.fromEntries(
          publicProducts.map((p) => [
            p.id,
            `৳${p.estimatedShippingRate.ratePerKgBdt}/kg (আনুমানিক)`,
          ]),
        ),
      },
      {
        name: 'isGenuineCertified',
        labelBn: 'জেনুইন সার্টিফাইড',
        labelEn: 'Genuine Certified',
        values: Object.fromEntries(
          publicProducts.map((p) => [
            p.id,
            p.isGenuineCertified ? '✓ সার্টিফাইড আসল' : 'নরমাল গ্রেড',
          ]),
        ),
      },
      {
        name: 'variantCount',
        labelBn: 'ভ্যারিয়েন্ট সংখ্যা',
        labelEn: 'Variants Available',
        values: Object.fromEntries(
          publicProducts.map((p) => [
            p.id,
            p.variants.length > 0 ? `${p.variants.length} ভ্যারিয়েন্ট` : 'স্ট্যান্ডার্ড',
          ]),
        ),
      },
    ];

    return {
      products: publicProducts,
      attributes,
    };
  }

  /**
   * Bundle suggestions: Suggests complementary accessories from adjacent categories with bundle discount
   */
  async getBundleSuggestions(productId: string): Promise<BundleSuggestion[]> {
    const primary = await this.getProductByIdOrSku(productId);

    // Find complementary products from different categories
    const complementary = await this.prisma.product.findMany({
      where: {
        id: { not: primary.id },
        categoryId: { not: primary.categoryId },
        deletedAt: null,
        isActive: true,
        singlePieceAvailable: true,
      },
      select: PUBLIC_PRODUCT_SELECT,
      take: 2,
      orderBy: { createdAt: 'desc' },
    });

    if (complementary.length === 0) {
      return [];
    }

    const bundledPublicItems = complementary.map(toPublicProductResponse);
    const individualTotal =
      primary.retailPriceBdt +
      bundledPublicItems.reduce((acc, item) => acc + item.retailPriceBdt, 0);

    const discountPercentage = 8; // 8% bundle savings
    const bundlePrice = Math.round(individualTotal * (1 - discountPercentage / 100));
    const savings = individualTotal - bundlePrice;

    return [
      {
        bundleId: `bundle-${primary.id.slice(0, 8)}`,
        titleBn: `${primary.titleBn} মেগা বান্ডেল প্যাক`,
        titleEn: `${primary.titleEn} Complete Setup Bundle`,
        primaryProduct: primary,
        bundledItems: bundledPublicItems,
        individualTotalBdt: individualTotal,
        bundlePriceBdt: bundlePrice,
        discountPercentage,
        savingsBdt: savings,
      },
    ];
  }
}
