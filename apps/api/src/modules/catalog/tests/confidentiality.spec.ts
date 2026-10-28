import { toPublicProductResponse } from '../dto/public-product.dto';
import { Prisma } from '@prisma/client';

describe('Catalog Confidentiality Rule: sourcing_price_cny MUST NEVER be exposed in public responses', () => {
  const mockProductWithSourcing = {
    id: 'prod-001',
    sku: 'SKU-TEST-001',
    categoryId: 'cat-001',
    titleBn: 'পরীক্ষামূলক পণ্য',
    titleEn: 'Test Product',
    descriptionBn: 'বিবরণ',
    descriptionEn: 'Description',
    sourcingPriceCny: new Prisma.Decimal(120.5), // Internal China sourcing price
    sourcing_price_cny: 120.5,
    retailPriceBdt: new Prisma.Decimal(3500),
    dealerPriceBdt: new Prisma.Decimal(3100),
    moq: 1,
    singlePieceAvailable: true,
    avgShippingRatePerKgBdt: new Prisma.Decimal(850),
    warrantyMonths: 12,
    isGenuineCertified: true,
    estimatedWeightGrams: 450,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
    variants: [
      {
        id: 'var-1',
        name: 'Black',
        skuSuffix: '-BLK',
        priceAdjustmentBdt: new Prisma.Decimal(0),
        stock: 15,
      },
    ],
    media: [
      {
        id: 'med-1',
        url: 'https://images.gadgetbazar.com/p1.webp',
        mediaType: 'image',
        sortOrder: 0,
        altText: 'Product 1',
      },
    ],
  };

  it('toPublicProductResponse strips sourcingPriceCny property from output', () => {
    const publicResult = toPublicProductResponse(mockProductWithSourcing);

    // Strict property checks
    expect((publicResult as any).sourcingPriceCny).toBeUndefined();
    expect((publicResult as any).sourcing_price_cny).toBeUndefined();
    expect(Object.keys(publicResult)).not.toContain('sourcingPriceCny');
    expect(Object.keys(publicResult)).not.toContain('sourcing_price_cny');
  });

  it('JSON serialized response does not leak sourcing_price_cny or sourcingPriceCny substring', () => {
    const publicResult = toPublicProductResponse(mockProductWithSourcing);
    const jsonString = JSON.stringify(publicResult);

    expect(jsonString).not.toContain('sourcingPriceCny');
    expect(jsonString).not.toContain('sourcing_price_cny');
    expect(jsonString).not.toContain('120.5'); // Sourcing price value itself must not leak
  });

  it('preserves public fields and correctly calculates estimated shipping rate', () => {
    const publicResult = toPublicProductResponse(mockProductWithSourcing);

    expect(publicResult.id).toBe('prod-001');
    expect(publicResult.sku).toBe('SKU-TEST-001');
    expect(publicResult.retailPriceBdt).toBe(3500);
    expect(publicResult.estimatedShippingRate.ratePerKgBdt).toBe(850);
    expect(publicResult.estimatedShippingRate.isEstimate).toBe(true);
    expect(publicResult.estimatedShippingRate.labelBn).toContain('আনুমানিক শিপিং রেট');
  });
});
