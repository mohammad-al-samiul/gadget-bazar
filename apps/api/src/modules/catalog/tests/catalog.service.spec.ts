import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from '../services/catalog.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ElasticsearchService } from '../services/elasticsearch.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('CatalogService', () => {
  let service: CatalogService;
  let mockPrisma: any;
  let mockElasticsearch: any;

  const mockProductDb = (id: string, overrides: Partial<any> = {}) => ({
    id,
    sku: `SKU-${id}`,
    categoryId: 'cat-phones',
    titleBn: `স্মার্টফোন ${id}`,
    titleEn: `Smartphone ${id}`,
    descriptionBn: 'বিবরণ',
    descriptionEn: 'Description',
    retailPriceBdt: new Prisma.Decimal(25000),
    dealerPriceBdt: new Prisma.Decimal(23000),
    moq: 1,
    singlePieceAvailable: true,
    avgShippingRatePerKgBdt: new Prisma.Decimal(850),
    warrantyMonths: 12,
    isGenuineCertified: true,
    estimatedWeightGrams: 200,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
    variants: [],
    media: [],
    category: {
      id: 'cat-phones',
      slug: 'smartphones',
      nameBn: 'স্মার্টফোন',
      nameEn: 'Smartphones',
      imageUrl: null,
    },
    ...overrides,
  });

  beforeEach(async () => {
    mockPrisma = {
      category: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    mockElasticsearch = {
      search: jest.fn(),
      indexProduct: jest.fn(),
      deleteProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ElasticsearchService, useValue: mockElasticsearch },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  describe('getCategories', () => {
    it('returns 2-level category tree with children', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: 'cat-electronics',
          slug: 'electronics',
          nameBn: 'ইলেকট্রনিক্স',
          nameEn: 'Electronics',
          imageUrl: 'https://cdn.gadgetbazar.com/cat.jpg',
          children: [
            {
              id: 'cat-phones',
              slug: 'phones',
              nameBn: 'ফোন',
              nameEn: 'Phones',
              imageUrl: null,
            },
          ],
        },
      ]);

      const result = await service.getCategories();
      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe('electronics');
      expect(result[0]!.children).toHaveLength(1);
      expect(result[0]!.children[0]!.slug).toBe('phones');
    });
  });

  describe('getProducts (Cursor Pagination & Filtering)', () => {
    it('returns cursor paginated items with hasMore and nextCursor', async () => {
      const p1 = mockProductDb('p1');
      const p2 = mockProductDb('p2');
      const p3 = mockProductDb('p3');

      // Requested limit = 2, so prisma takes 3 to compute hasMore
      mockPrisma.product.findMany.mockResolvedValue([p1, p2, p3]);

      const result = await service.getProducts({ limit: 2 });
      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe(Buffer.from('p2').toString('base64'));
    });

    it('filters by category including subcategory IDs', async () => {
      mockPrisma.category.findFirst.mockResolvedValue({
        id: 'cat-parent',
        slug: 'electronics',
        children: [{ id: 'sub-1' }, { id: 'sub-2' }],
      });
      mockPrisma.product.findMany.mockResolvedValue([mockProductDb('p1')]);

      await service.getProducts({ category: 'electronics' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: { in: ['cat-parent', 'sub-1', 'sub-2'] },
          }),
        }),
      );
    });
  });

  describe('searchProducts (Degraded Mode & Typo Tolerance)', () => {
    it('uses Elasticsearch results when cluster is online', async () => {
      mockElasticsearch.search.mockResolvedValue({
        productIds: ['p1', 'p2'],
        total: 2,
      });

      const p1 = mockProductDb('p1');
      const p2 = mockProductDb('p2');
      mockPrisma.product.findMany.mockResolvedValue([p2, p1]); // DB returns unordered

      const results = await service.searchProducts('xiaomi', 10);

      expect(results).toHaveLength(2);
      // Confirms Elasticsearch relevance ranking order is preserved (p1 then p2)
      expect(results[0]!.id).toBe('p1');
      expect(results[1]!.id).toBe('p2');
    });

    it('gracefully degrades to PostgreSQL ILIKE when Elasticsearch is down (returns null)', async () => {
      mockElasticsearch.search.mockResolvedValue(null); // cluster offline
      const fallbackP1 = mockProductDb('p1', { titleEn: 'Xiaomi Phone' });
      mockPrisma.product.findMany.mockResolvedValue([fallbackP1]);

      const results = await service.searchProducts('Xiaomi', 10);

      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe('p1');
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([{ titleEn: { contains: 'Xiaomi', mode: 'insensitive' } }]),
          }),
        }),
      );
    });
  });

  describe('compareProducts', () => {
    it('generates comparison matrix for 2-4 products', async () => {
      const p1 = mockProductDb('p1', { retailPriceBdt: new Prisma.Decimal(10000) });
      const p2 = mockProductDb('p2', { retailPriceBdt: new Prisma.Decimal(15000) });

      mockPrisma.product.findMany.mockResolvedValue([p1, p2]);

      const matrix = await service.compareProducts(['p1', 'p2']);

      expect(matrix.products).toHaveLength(2);
      expect(matrix.attributes.length).toBeGreaterThan(3);
      const priceRow = matrix.attributes.find((a) => a.name === 'retailPrice');
      expect(priceRow).toBeDefined();
      expect(priceRow?.values['p1']).toBe('৳10,000');
      expect(priceRow?.values['p2']).toBe('৳15,000');
    });

    it('rejects comparison with fewer than 2 products', async () => {
      await expect(service.compareProducts(['p1'])).rejects.toThrow(BadRequestException);
    });

    it('rejects comparison with more than 4 products', async () => {
      await expect(service.compareProducts(['p1', 'p2', 'p3', 'p4', 'p5'])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getBundleSuggestions', () => {
    it('creates bundle package with discounted total for complementary accessories', async () => {
      const primary = mockProductDb('primary-phone', {
        retailPriceBdt: new Prisma.Decimal(30000),
        categoryId: 'cat-phones',
      });
      const complementary1 = mockProductDb('accessory-case', {
        retailPriceBdt: new Prisma.Decimal(1000),
        categoryId: 'cat-cases',
      });
      const complementary2 = mockProductDb('accessory-charger', {
        retailPriceBdt: new Prisma.Decimal(2000),
        categoryId: 'cat-chargers',
      });

      mockPrisma.product.findFirst.mockResolvedValue(primary);
      mockPrisma.product.findMany.mockResolvedValue([complementary1, complementary2]);

      const bundles = await service.getBundleSuggestions('primary-phone');

      expect(bundles).toHaveLength(1);
      expect(bundles[0]!.individualTotalBdt).toBe(33000);
      expect(bundles[0]!.discountPercentage).toBe(8);
      expect(bundles[0]!.bundlePriceBdt).toBe(Math.round(33000 * 0.92));
      expect(bundles[0]!.savingsBdt).toBe(33000 - Math.round(33000 * 0.92));
    });

    it('throws NotFoundException if primary product is missing', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);
      await expect(service.getBundleSuggestions('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
