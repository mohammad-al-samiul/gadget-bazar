import { PrismaClient, Role, KycStatus, DealStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const defaultPassword = await argon2.hash('GadgetBazar@2026!');

  // -------------------------------------------------------------------------
  // 1. Users
  // -------------------------------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gadgetbazar.com' },
    update: {},
    create: {
      email: 'admin@gadgetbazar.com',
      phone: '+8801700000001',
      passwordHash: defaultPassword,
      fullName: 'System Administrator',
      role: Role.ADMIN,
      kycStatus: KycStatus.APPROVED,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'sakib@example.com' },
    update: {},
    create: {
      email: 'sakib@example.com',
      phone: '+8801711111111',
      passwordHash: defaultPassword,
      fullName: 'Sakib Al Hasan',
      role: Role.CUSTOMER,
      loyaltyPoints: 120,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'tamim@example.com' },
    update: {},
    create: {
      email: 'tamim@example.com',
      phone: '+8801722222222',
      passwordHash: defaultPassword,
      fullName: 'Tamim Iqbal',
      role: Role.CUSTOMER,
      loyaltyPoints: 50,
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: 'mushfiq@example.com' },
    update: {},
    create: {
      email: 'mushfiq@example.com',
      phone: '+8801733333333',
      passwordHash: defaultPassword,
      fullName: 'Mushfiqur Rahim',
      role: Role.CUSTOMER,
      loyaltyPoints: 200,
    },
  });

  const dealerUser = await prisma.user.upsert({
    where: { email: 'dealer1@example.com' },
    update: {},
    create: {
      email: 'dealer1@example.com',
      phone: '+8801744444444',
      passwordHash: defaultPassword,
      fullName: 'Habib Enterprise',
      role: Role.DEALER,
      kycStatus: KycStatus.UNDER_REVIEW,
    },
  });

  const riderUser1 = await prisma.user.upsert({
    where: { email: 'rider1@gadgetbazar.com' },
    update: {},
    create: {
      email: 'rider1@gadgetbazar.com',
      phone: '+8801755555555',
      passwordHash: defaultPassword,
      fullName: 'Rakib Hossain (Rider)',
      role: Role.RIDER,
      kycStatus: KycStatus.APPROVED,
    },
  });

  const riderUser2 = await prisma.user.upsert({
    where: { email: 'rider2@gadgetbazar.com' },
    update: {},
    create: {
      email: 'rider2@gadgetbazar.com',
      phone: '+8801766666666',
      passwordHash: defaultPassword,
      fullName: 'Tanvir Ahmed (Rider)',
      role: Role.RIDER,
      kycStatus: KycStatus.APPROVED,
    },
  });

  console.log('✅ Users seeded: 1 admin, 3 customers, 1 dealer, 2 riders');

  // -------------------------------------------------------------------------
  // 2. Dealer & Rider Profiles
  // -------------------------------------------------------------------------
  const dealer = await prisma.dealer.upsert({
    where: { userId: dealerUser.id },
    update: {},
    create: {
      userId: dealerUser.id,
      businessName: 'Habib Electronics Ltd.',
      tradeLicenseNo: 'TRAD/DNCC/2026/04912',
      kycStatus: KycStatus.UNDER_REVIEW,
    },
  });

  await prisma.rider.upsert({
    where: { userId: riderUser1.id },
    update: {},
    create: {
      userId: riderUser1.id,
      vehicleType: 'MOTORCYCLE',
      currentLat: 23.8103,
      currentLng: 90.4125,
      isActive: true,
    },
  });

  await prisma.rider.upsert({
    where: { userId: riderUser2.id },
    update: {},
    create: {
      userId: riderUser2.id,
      vehicleType: 'BICYCLE',
      currentLat: 23.7937,
      currentLng: 90.4066,
      isActive: true,
    },
  });

  console.log('✅ Dealer and Rider profiles seeded');

  // -------------------------------------------------------------------------
  // 3. Categories
  // -------------------------------------------------------------------------
  const catPhones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      slug: 'smartphones',
      nameBn: 'স্মার্টফোন ও গ্যাজেট',
      nameEn: 'Smartphones & Handhelds',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560',
    },
  });

  const catAudio = await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: {
      slug: 'audio',
      nameBn: 'অডিও ও হেডফোন',
      nameEn: 'Audio & Headphones',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    },
  });

  const catSmartHome = await prisma.category.upsert({
    where: { slug: 'smart-home' },
    update: {},
    create: {
      slug: 'smart-home',
      nameBn: 'স্মার্ট হোম ডিভাইস',
      nameEn: 'Smart Home Devices',
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827',
    },
  });

  console.log('✅ Categories seeded: 3 categories');

  // -------------------------------------------------------------------------
  // 4. Products (10 total: 5 single-piece, 5 bulk/MOQ)
  // -------------------------------------------------------------------------
  const productsData = [
    // 5 Single-Piece Products
    {
      sku: 'GB-ANC-001',
      categoryId: catAudio.id,
      titleBn: 'বেসাস বাউই এইচ১আই ওয়্যারলেস হেডফোন',
      titleEn: 'Baseus Bowie H1i Wireless ANC Headphones',
      descriptionBn: 'হাই-রেজ অডিও সার্টিফাইড, এলডিএসি কোডেক সাপোর্ট এবং ১০০ ঘণ্টার ব্যাটারি লাইফ।',
      descriptionEn:
        'Hi-Res Audio certified, LDAC support, and up to 100 hours battery life with active noise cancellation.',
      sourcingPriceCny: '185.00',
      retailPriceBdt: '3950.00',
      dealerPriceBdt: '3400.00',
      moq: 1,
      singlePieceAvailable: true,
      avgShippingRatePerKgBdt: '950.00',
      warrantyMonths: 12,
      isGenuineCertified: true,
      estimatedWeightGrams: 320,
    },
    {
      sku: 'GB-TWS-002',
      categoryId: catAudio.id,
      titleBn: 'কিউসিওয়াই টি১৩ এএনসি ট্রু ওয়্যারলেস ইয়ারবাডস',
      titleEn: 'QCY T13 ANC True Wireless Earbuds',
      descriptionBn: '৪-মাইক নয়েজ ক্যান্সেলেশন সহ ব্লুটুথ ৫.৩ সাশ্রয়ী ইয়ারফোন।',
      descriptionEn:
        'Affordable TWS with 4-mic ENC noise cancellation and Bluetooth 5.3 connection.',
      sourcingPriceCny: '62.00',
      retailPriceBdt: '1450.00',
      dealerPriceBdt: '1200.00',
      moq: 1,
      singlePieceAvailable: true,
      avgShippingRatePerKgBdt: '950.00',
      warrantyMonths: 6,
      isGenuineCertified: true,
      estimatedWeightGrams: 110,
    },
    {
      sku: 'GB-HUB-003',
      categoryId: catSmartHome.id,
      titleBn: 'আকারা এম২ স্মার্ট জিগবি ৩.০ গেটওয়ে হাব',
      titleEn: 'Aqara M2 Smart Zigbee 3.0 Gateway Hub',
      descriptionBn:
        'স্মার্ট হোম অটোমেশনের জন্য অল-ইন-ওয়ান গেটওয়ে, অ্যাপল হোমকিট ও গুগল হোম সাপোর্ট।',
      descriptionEn:
        'All-in-one smart home gateway with Apple HomeKit and Google Home integration.',
      sourcingPriceCny: '140.00',
      retailPriceBdt: '3200.00',
      dealerPriceBdt: '2800.00',
      moq: 1,
      singlePieceAvailable: true,
      avgShippingRatePerKgBdt: '950.00',
      warrantyMonths: 12,
      isGenuineCertified: true,
      estimatedWeightGrams: 240,
    },
    {
      sku: 'GB-CAM-004',
      categoryId: catSmartHome.id,
      titleBn: 'শাওমি স্মার্ট ক্যামেরা সি৩০০ ২কে ৩৬০ ডিগ্রি',
      titleEn: 'Xiaomi Smart Camera C300 2K 360° Pan-Tilt',
      descriptionBn: 'আল্ট্রা-ক্লিয়ার ২কে রেজোলিউশন, এআই হিউম্যান ডিটেকশন ও ফুল কালার নাইট ভিশন।',
      descriptionEn:
        'Ultra-clear 2K HD video, AI human tracking, and full-color low-light night vision.',
      sourcingPriceCny: '115.00',
      retailPriceBdt: '2750.00',
      dealerPriceBdt: '2350.00',
      moq: 1,
      singlePieceAvailable: true,
      avgShippingRatePerKgBdt: '950.00',
      warrantyMonths: 12,
      isGenuineCertified: true,
      estimatedWeightGrams: 310,
    },
    {
      sku: 'GB-BNG-005',
      categoryId: catPhones.id,
      titleBn: 'শাওমি স্মার্ট ব্যান্ড ৮ অ্যাক্টিভ ব্ল্যাক',
      titleEn: 'Xiaomi Smart Band 8 Active - Black',
      descriptionBn: '১.৪৭ ইঞ্চি টিএফটি ডিসপ্লে, ৫০+ স্পোর্টস মোড এবং ১৪ দিনের ব্যাটারি লাইফ।',
      descriptionEn:
        '1.47 inch vibrant display, 50+ fitness tracking modes, and up to 14 days endurance.',
      sourcingPriceCny: '78.00',
      retailPriceBdt: '1950.00',
      dealerPriceBdt: '1650.00',
      moq: 1,
      singlePieceAvailable: true,
      avgShippingRatePerKgBdt: '950.00',
      warrantyMonths: 6,
      isGenuineCertified: true,
      estimatedWeightGrams: 90,
    },

    // 5 Bulk / MOQ Products
    {
      sku: 'GB-PBK-006',
      categoryId: catPhones.id,
      titleBn: 'রোমস সেন্স ৮ প্লাস ৩০,০০০ এমএএইচ পাওয়ার ব্যাংক (কার্টন প্যাক)',
      titleEn: 'Romoss Sense 8+ 30,000mAh Power Bank (Carton Pack)',
      descriptionBn: '১৮ওয়াট টু-ওয়ে কুইক চার্জ। ডিলারদের জন্য মিনিমাম অর্ডার কোয়ান্টিটি ১০ পিস।',
      descriptionEn: '18W two-way fast charging high capacity power banks. Minimum order 10 units.',
      sourcingPriceCny: '72.00',
      retailPriceBdt: '1850.00',
      dealerPriceBdt: '1450.00',
      moq: 10,
      singlePieceAvailable: false,
      avgShippingRatePerKgBdt: '850.00',
      warrantyMonths: 6,
      isGenuineCertified: true,
      estimatedWeightGrams: 670,
    },
    {
      sku: 'GB-CHG-007',
      categoryId: catPhones.id,
      titleBn: 'ইউগ্রিন নেক্সোড ৪৫ ওয়াট গ্যান ডুয়াল ইউএসবি-সি চার্জার (লট)',
      titleEn: 'UGREEN Nexode 45W GaN Dual USB-C Fast Charger (Wholesale Lot)',
      descriptionBn: 'গ্যালিয়াম নাইট্রাইড টেকনোলজি, ফোল্ডেবল পিন, পাইকারি লট ২৫ পিস।',
      descriptionEn:
        'Gallium Nitride high-efficiency dual port wall charger. Wholesale minimum 25 units.',
      sourcingPriceCny: '48.00',
      retailPriceBdt: '1250.00',
      dealerPriceBdt: '950.00',
      moq: 25,
      singlePieceAvailable: false,
      avgShippingRatePerKgBdt: '850.00',
      warrantyMonths: 12,
      isGenuineCertified: true,
      estimatedWeightGrams: 140,
    },
    {
      sku: 'GB-CBL-008',
      categoryId: catPhones.id,
      titleBn: 'বেসাস ক্যাফেলে সি-টু-সি ১০০ ওয়াট ব্রেইডেড ক্যাবল (৫০ পিস বান্ডেল)',
      titleEn: 'Baseus Cafule 100W PD Type-C to Type-C Braided Cable (50pcs Bundle)',
      descriptionBn:
        'উচ্চ স্থায়িত্ব সম্পন্ন অ্যালুমিনিয়াম অ্যালয় ক্যাবল বান্ডেল পাইকারি বিক্রয়ের জন্য।',
      descriptionEn:
        'Ultra durable braided cables with E-marker chip. Minimum bundle size 50 pieces.',
      sourcingPriceCny: '11.00',
      retailPriceBdt: '320.00',
      dealerPriceBdt: '210.00',
      moq: 50,
      singlePieceAvailable: false,
      avgShippingRatePerKgBdt: '850.00',
      warrantyMonths: 3,
      isGenuineCertified: true,
      estimatedWeightGrams: 45,
    },
    {
      sku: 'GB-SEN-009',
      categoryId: catSmartHome.id,
      titleBn: 'সোনফ জিগবি টেম্পারেচার অ্যান্ড হিউমিডিটি সেন্সর (২০ পিস প্যাক)',
      titleEn: 'Sonoff SNZB-02D Zigbee LCD Temp & Humidity Sensor (20pcs Pack)',
      descriptionBn: 'স্মার্ট হোম ডিলারদের জন্য কমপ্যাক্ট এলসিডি ডিসপ্লে সেন্সর প্যাক।',
      descriptionEn:
        'Real-time temperature and humidity monitoring with LCD screen. Wholesale pack 20 units.',
      sourcingPriceCny: '29.00',
      retailPriceBdt: '750.00',
      dealerPriceBdt: '560.00',
      moq: 20,
      singlePieceAvailable: false,
      avgShippingRatePerKgBdt: '850.00',
      warrantyMonths: 6,
      isGenuineCertified: true,
      estimatedWeightGrams: 60,
    },
    {
      sku: 'GB-SPK-010',
      categoryId: catAudio.id,
      titleBn: 'ট্রিবিট স্টর্মবক্স মাইক্রো ২ পোর্টেবল স্পিকার (১০ পিস লট)',
      titleEn: 'Tribit StormBox Micro 2 Portable IP67 Speaker (10pcs Lot)',
      descriptionBn:
        'আইপি৬৭ ওয়াটারপ্রুফ, ১২ ঘণ্টার প্লেব্যাক। খুচরা ও ডিলার স্টকের জন্য ১০ পিস প্যাক।',
      descriptionEn:
        'Rugged outdoor IP67 waterproof speaker with heavy bass. Bulk minimum 10 pieces.',
      sourcingPriceCny: '135.00',
      retailPriceBdt: '3350.00',
      dealerPriceBdt: '2750.00',
      moq: 10,
      singlePieceAvailable: false,
      avgShippingRatePerKgBdt: '850.00',
      warrantyMonths: 12,
      isGenuineCertified: true,
      estimatedWeightGrams: 315,
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
    createdProducts.push(prod);
  }

  console.log('✅ Products seeded: 10 items (5 single-piece, 5 bulk/MOQ)');

  // -------------------------------------------------------------------------
  // 5. Group Deal & Participants
  // -------------------------------------------------------------------------
  const targetProduct = createdProducts[0]; // Baseus Bowie H1i
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7); // Active for 7 days

  const groupDeal = await prisma.groupDeal.create({
    data: {
      productId: targetProduct.id,
      targetParticipants: 5,
      currentParticipants: 2,
      pricePerUnitBdt: '3200.00', // Normal retail is 3950
      deadline,
      status: DealStatus.ACTIVE,
    },
  });

  await prisma.groupDealParticipant.create({
    data: {
      dealId: groupDeal.id,
      userId: customer1.id,
      quantity: 1,
    },
  });

  await prisma.groupDealParticipant.create({
    data: {
      dealId: groupDeal.id,
      userId: customer2.id,
      quantity: 1,
    },
  });

  console.log('✅ Group deal seeded: 1 active deal with 2 participants');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
