import { Test, TestingModule } from '@nestjs/testing';
import { AdminCatalogService } from '../services/admin-catalog.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchService } from '../services/elasticsearch.service';
import { OutboxService } from '../../outbox/outbox.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('AdminCatalogService', () => {
  let service: AdminCatalogService;
  let mockPrisma: any;
  let mockElasticsearch: any;
  let mockOutbox: any;

  beforeEach(async () => {
    mockPrisma = {
      category: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    mockElasticsearch = {
      indexProduct: jest.fn().mockResolvedValue(true),
      deleteProduct: jest.fn().mockResolvedValue(true),
    };

    mockOutbox = {
      createEvent: jest.fn().mockResolvedValue({ id: 'outbox-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCatalogService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ElasticsearchService, useValue: mockElasticsearch },
        { provide: OutboxService, useValue: mockOutbox },
      ],
    }).compile();

    service = module.get<AdminCatalogService>(AdminCatalogService);
  });

  describe('createProduct', () => {
    const validDto = {
      sku: 'SKU-NEW-001',
      categoryId: 'cat-phones',
      titleBn: 'নতুন স্মার্টফোন',
      titleEn: 'New Smartphone',
      descriptionBn: 'বিবরণ',
      descriptionEn: 'Description',
      sourcingPriceCny: 150,
      retailPriceBdt: 4500,
      dealerPriceBdt: 4000,
      moq: 1,
      singlePieceAvailable: true,
      avgShippingRatePerKgBdt: 850,
      warrantyMonths: 6,
      isGenuineCertified: true,
      estimatedWeightGrams: 300,
    };

    it('creates product in transaction, writes outbox event, and syncs search index', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-phones' });
      mockPrisma.product.findUnique.mockResolvedValue(null); // SKU does not exist
      mockPrisma.product.create.mockResolvedValue({
        id: 'prod-new-1',
        ...validDto,
      });

      const result = await service.createProduct(validDto);

      expect(result.id).toBe('prod-new-1');
      expect(mockPrisma.product.create).toHaveBeenCalled();
      expect(mockOutbox.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateType: 'Product',
          aggregateId: 'prod-new-1',
        }),
        mockPrisma,
      );
      expect(mockElasticsearch.indexProduct).toHaveBeenCalled();
    });

    it('throws BadRequestException if SKU already exists', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-phones' });
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'existing-p' });

      await expect(service.createProduct(validDto)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if Category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.createProduct(validDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProduct', () => {
    it('updates product and updates search index', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        deletedAt: null,
      });
      mockPrisma.product.update.mockResolvedValue({
        id: 'prod-1',
        titleEn: 'Updated Title',
        retailPriceBdt: new Prisma.Decimal(5000),
      });

      const result = await service.updateProduct('prod-1', {
        titleEn: 'Updated Title',
        retailPriceBdt: 5000,
      });

      expect(result.titleEn).toBe('Updated Title');
      expect(mockElasticsearch.indexProduct).toHaveBeenCalled();
    });

    it('throws NotFoundException if product is missing or soft-deleted', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        deletedAt: new Date(),
      });

      await expect(service.updateProduct('prod-1', { titleEn: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProduct', () => {
    it('soft-deletes product and removes it from search index', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.product.update.mockResolvedValue({
        id: 'prod-1',
        deletedAt: new Date(),
        isActive: false,
      });

      const result = await service.deleteProduct('prod-1');

      expect(result.success).toBe(true);
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: expect.objectContaining({ isActive: false }),
        }),
      );
      expect(mockElasticsearch.deleteProduct).toHaveBeenCalledWith('prod-1');
    });
  });

  describe('fullReindex', () => {
    it('indexes all active non-deleted products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        {
          id: 'p1',
          sku: 'SKU1',
          retailPriceBdt: new Prisma.Decimal(100),
          categoryId: 'c1',
          isActive: true,
        },
        {
          id: 'p2',
          sku: 'SKU2',
          retailPriceBdt: new Prisma.Decimal(200),
          categoryId: 'c1',
          isActive: true,
        },
      ]);

      const result = await service.fullReindex();

      expect(result.enqueued).toBe(2);
      expect(mockElasticsearch.indexProduct).toHaveBeenCalledTimes(2);
    });
  });
});
