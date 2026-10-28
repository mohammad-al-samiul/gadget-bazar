export interface PublicVariantResponse {
  id: string;
  name: string;
  skuSuffix: string;
  priceAdjustmentBdt: number;
  stock: number;
}

export interface PublicMediaResponse {
  id: string;
  url: string;
  mediaType: string;
  sortOrder: number;
  altText: string | null;
}

export interface PublicCategoryResponse {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  imageUrl?: string | null;
}

export interface PublicProductResponse {
  id: string;
  sku: string;
  categoryId: string;
  category?: PublicCategoryResponse;
  titleBn: string;
  titleEn: string;
  descriptionBn: string | null;
  descriptionEn: string | null;
  retailPriceBdt: number;
  dealerPriceBdt?: number | null;
  moq: number;
  singlePieceAvailable: boolean;
  estimatedShippingRate: {
    ratePerKgBdt: number;
    isEstimate: true; // Explicitly marked as estimate per business rules
    labelBn: string;
    labelEn: string;
  };
  warrantyMonths: number;
  isGenuineCertified: boolean;
  estimatedWeightGrams: number;
  isActive: boolean;
  variants: PublicVariantResponse[];
  media: PublicMediaResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Strict serializer that NEVER includes sourcingPriceCny in public or dealer payloads.
 */
export function toPublicProductResponse(product: any): PublicProductResponse {
  const {
    sourcingPriceCny: _sourcingPriceCny, // stripped!
    sourcing_price_cny: _sourcing_price_cny, // stripped!
    ...safeProduct
  } = product;

  // Assert at runtime in development/test that sourcingPriceCny is completely absent
  if ('sourcingPriceCny' in safeProduct || 'sourcing_price_cny' in safeProduct) {
    throw new Error('SECURITY VIOLATION: sourcing_price_cny leaked into public serializer!');
  }

  const shippingRate = Number(safeProduct.avgShippingRatePerKgBdt ?? 0);

  return {
    id: safeProduct.id,
    sku: safeProduct.sku,
    categoryId: safeProduct.categoryId,
    category: safeProduct.category
      ? {
          id: safeProduct.category.id,
          slug: safeProduct.category.slug,
          nameBn: safeProduct.category.nameBn,
          nameEn: safeProduct.category.nameEn,
          imageUrl: safeProduct.category.imageUrl,
        }
      : undefined,
    titleBn: safeProduct.titleBn,
    titleEn: safeProduct.titleEn,
    descriptionBn: safeProduct.descriptionBn ?? null,
    descriptionEn: safeProduct.descriptionEn ?? null,
    retailPriceBdt: Number(safeProduct.retailPriceBdt),
    dealerPriceBdt: safeProduct.dealerPriceBdt ? Number(safeProduct.dealerPriceBdt) : null,
    moq: safeProduct.moq,
    singlePieceAvailable: safeProduct.singlePieceAvailable,
    estimatedShippingRate: {
      ratePerKgBdt: shippingRate,
      isEstimate: true,
      labelBn: `আনুমানিক শিপিং রেট ৳${shippingRate}/কেজি (বাংলাদেশে পৌঁছানোর পর ওজন মেপে চূড়ান্ত বিল হবে)`,
      labelEn: `Estimated shipping rate ৳${shippingRate}/kg (final charge calculated upon weighing in BD)`,
    },
    warrantyMonths: safeProduct.warrantyMonths,
    isGenuineCertified: safeProduct.isGenuineCertified,
    estimatedWeightGrams: safeProduct.estimatedWeightGrams,
    isActive: safeProduct.isActive,
    variants: (safeProduct.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      skuSuffix: v.skuSuffix,
      priceAdjustmentBdt: Number(v.priceAdjustmentBdt ?? 0),
      stock: v.stock,
    })),
    media: (safeProduct.media || []).map((m: any) => ({
      id: m.id,
      url: m.url,
      mediaType: m.mediaType,
      sortOrder: m.sortOrder,
      altText: m.altText ?? null,
    })),
    createdAt: safeProduct.createdAt
      ? new Date(safeProduct.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: safeProduct.updatedAt
      ? new Date(safeProduct.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}
