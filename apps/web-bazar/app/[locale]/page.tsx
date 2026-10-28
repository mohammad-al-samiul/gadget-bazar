'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Modal,
  Toast,
  Skeleton,
  ShipmentTimeline,
  PriceBreakdown,
  StageChip,
} from '@gadgetbazar/ui';

export default function HomePage() {
  const t = useTranslations('Homepage');
  const tCommon = useTranslations('Common');
  const tNav = useTranslations('Nav');
  const locale = useLocale() as 'bn' | 'en';

  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);

  const targetLocale = locale === 'bn' ? 'en' : 'bn';

  const timelineEvents = [
    {
      stage: 'at_china_wh',
      titleBn: 'চীন ওয়্যারহাউসে রিসিভড ও কোয়ালিটি চেক',
      titleEn: 'Received at China Warehouse & Inspected',
      descriptionBn: 'পণ্য ফ্যাক্টরি থেকে সফলভাবে সংগৃহীত ও প্যাকিং সম্পন্ন হয়েছে।',
      timestamp: '24 Oct 2026, 14:30',
      status: 'completed' as const,
    },
    {
      stage: 'in_transit',
      titleBn: 'এয়ার কার্গোতে বাংলাদেশে পথে (ট্রানজিট)',
      titleEn: 'Air Cargo Dispatched to Bangladesh',
      descriptionBn: 'ফ্লাইট নম্বর CZ3051 ঢাকা শাহজালাল আন্তর্জাতিক বিমানবন্দরের পথে রওনা হয়েছে।',
      timestamp: '26 Oct 2026, 09:15',
      status: 'completed' as const,
    },
    {
      stage: 'arrived_bd',
      titleBn: 'বাংলাদেশে পৌঁছেছে এবং কাস্টমস ক্লিয়ারেন্স সম্পন্ন',
      titleEn: 'Arrived in BD & Customs Cleared',
      descriptionBn: 'কাস্টমস ডিউটি ও ছাড়পত্র নিশ্চিত হয়েছে। ওয়্যারহাউসে পৌঁছানো হয়েছে।',
      timestamp: '27 Oct 2026, 17:45',
      status: 'completed' as const,
    },
    {
      stage: 'weighed_awaiting_shipping_payment',
      titleBn: 'ওজন সম্পন্ন — শিপিং বিল প্রদেয় (ধাপ ২)',
      titleEn: 'Weighed & Ready for Shipping Payment (Stage 2)',
      descriptionBn: 'প্রকৃত ওজন: ৪৫০ গ্রাম। চূড়ান্ত শিপিং বিল ৳৩৮২ টাকা প্রদেয়।',
      timestamp: '28 Oct 2026, 10:00',
      status: 'active' as const,
    },
    {
      stage: 'out_for_delivery',
      titleBn: 'রাইডার দ্বারা হোম ডেলিভারি শুরু',
      titleEn: 'Out for Delivery by Rider',
      descriptionBn: 'শিপিং পরিশোধের পর রাইডার ডেলিভারি সম্পন্ন করবেন।',
      status: 'pending' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-ground text-white font-sans">
      {/* 1. TOP ANNOUNCEMENT STRIP (NON-NEGOTIABLE TWO-STAGE MESSAGE) */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-900 px-4 py-2 text-center text-xs sm:text-sm font-medium text-white shadow-sm flex items-center justify-center gap-2">
        <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase">
          {locale === 'bn' ? 'জরুরি নিয়ম' : 'Key Rule'}
        </span>
        <span>{tCommon('twoStageNotice')}</span>
      </div>

      {/* 2. HEADER SHELL */}
      <header className="sticky top-0 z-40 bg-surface-ground/90 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 text-xl font-bold font-sora tracking-tight"
            >
              <span className="text-brand-blue text-2xl font-black">G</span>
              <span>
                Gadget<span className="text-brand-orange">Bazar</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-surface-elevated text-gray-400 text-xs border border-surface-border">
              {locale === 'bn' ? 'চায়না-আমদানি মার্কেটপ্লেস' : 'China Import Hub'}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link
              href={`/${locale}`}
              className="text-white hover:text-brand-blue transition-colors"
            >
              {tNav('home')}
            </Link>
            <Link
              href={`/${locale}#categories`}
              className="hover:text-brand-blue transition-colors"
            >
              {tNav('categories')}
            </Link>
            <Link href={`/${locale}#deals`} className="hover:text-brand-orange transition-colors">
              {tNav('groupDeals')}
            </Link>
            <Link href={`/${locale}#tracking`} className="hover:text-brand-blue transition-colors">
              {tNav('tracking')}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`/${targetLocale}`}
              className="px-3 py-1 text-xs font-semibold rounded-base border border-surface-border hover:border-brand-blue text-gray-300 hover:text-white transition-all bg-surface-card"
            >
              🌐 {tCommon('switchLanguage')}
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="shadow-glow"
            >
              {locale === 'bn' ? 'টেস্ট মডেল দেখুন' : 'View Demo Modal'}
            </Button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        <section className="text-center max-w-3xl mx-auto space-y-5 pt-4">
          <div className="inline-flex items-center gap-2">
            <Badge variant="genuine">
              ✓ {locale === 'bn' ? '১০০% জেনুইন সার্টিফাইড' : '100% Genuine Certified'}
            </Badge>
            <Badge variant="accent" dot>
              {locale === 'bn' ? 'পাইকারি ও গ্রুপ ডিল' : 'B2B & Group Deals'}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-sora tracking-tight leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            {t('heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button variant="primary" size="lg" className="shadow-glow">
              {t('buyNow')} (৳৩,৫০০)
            </Button>
            <Button variant="accent" size="lg" className="shadow-glow-orange">
              🔥 {t('joinDeal')} (-25%)
            </Button>
            <Button variant="outline" size="lg">
              {locale === 'bn' ? 'লাইভ ট্র্যাকিং দেখুন' : 'Track Shipment'}
            </Button>
          </div>
        </section>

        {/* 4. DISMISSIBLE TOAST DEMO */}
        {toastVisible && (
          <section className="max-w-2xl mx-auto">
            <Toast
              type="success"
              title={locale === 'bn' ? 'ধাপ ১ পেমেন্ট নিশ্চিতকরণ' : 'Stage 1 Payment Confirmed'}
              message={
                locale === 'bn'
                  ? 'আপনার পণ্যের অর্ডার গ্রহণ করা হয়েছে। পণ্যটি বাংলাদেশে পৌঁছানোর পর ওজন মেপে ধাপ ২ এর শিপিং বিল প্রদান করবেন।'
                  : 'Product order confirmed at China factory. Shipping bill will be issued only after weighing in Bangladesh.'
              }
              onDismiss={() => setToastVisible(false)}
            />
          </section>
        )}

        {/* 5. TWO-STAGE PAYMENT DEMO & SHIPMENT TIMELINE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Two-Stage Price Breakdown Component */}
          <div>
            <h2 className="text-xl font-bold font-sora mb-3 text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              {locale === 'bn' ? 'স্বচ্ছ ২-ধাপের প্রাইস ব্রেকডাউন' : 'Two-Stage Price Breakdown'}
            </h2>
            <PriceBreakdown
              productPriceBdt={3500}
              estimatedWeightGrams={450}
              shippingRatePerKgBdt={850}
              locale={locale}
            />
          </div>

          {/* Shipment Timeline Stepper Component */}
          <div>
            <h2 className="text-xl font-bold font-sora mb-3 text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-blue" />
              {locale === 'bn' ? 'রিয়েল-টাইম শিপমেন্ট টাইমলাইন' : 'Real-time Cargo Stepper'}
            </h2>
            <div className="bg-surface-card border border-surface-border p-5 rounded-md shadow-card">
              <ShipmentTimeline events={timelineEvents} mode="air" locale={locale} />
            </div>
          </div>
        </section>

        {/* 6. PRIMITIVES & DESIGN SYSTEM SHOWCASE */}
        <section className="space-y-6 pt-6 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-sora text-white">
                {locale === 'bn'
                  ? 'শেয়ার্ড UI প্রিমিটিভস (packages/ui)'
                  : 'Shared UI Primitives Gallery'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {locale === 'bn'
                  ? 'টেলউইন্ড সিএসএস ও ডিজাইন টোকেন দিয়ে নির্মিত প্রিমিয়াম কম্পোনেন্ট'
                  : 'Tailwind components powered by @gadgetbazar/design-tokens'}
              </p>
            </div>
            <Badge variant="brand">{locale === 'bn' ? '১০টি কম্পোনেন্ট' : '10 Primitives'}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input & Form Primitives */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>{locale === 'bn' ? 'ইনপুট ও ফরম প্রিমিটিভস' : 'Form Inputs'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  label={locale === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  placeholder="01712-345678"
                  leftAddon="+880"
                />
                <Input
                  label={locale === 'bn' ? 'সার্চ করুন' : 'Search Gadgets'}
                  placeholder={
                    locale === 'bn' ? 'যেমন: হেডফোন, ট্র্যাকার...' : 'e.g. smartwatch, charger'
                  }
                />
              </CardContent>
            </Card>

            {/* Badges & Status Chips */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>
                  {locale === 'bn' ? 'স্ট্যাটাস চিপস ও ব্যাজ' : 'Lifecycle Stage Chips'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <StageChip stage="placed" locale={locale} />
                <StageChip stage="product_paid" locale={locale} />
                <StageChip stage="in_transit" locale={locale} />
                <StageChip stage="weighed_awaiting_shipping_payment" locale={locale} />
                <StageChip stage="delivered" locale={locale} />
                <StageChip stage="kyc_approved" locale={locale} />
              </CardContent>
            </Card>

            {/* Skeleton Shimmer Loaders */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>{locale === 'bn' ? 'স্কেলিটন লোডার' : 'Shimmer Skeletons'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs text-gray-500 font-mono">Loading state preview</span>
                <Skeleton className="h-7 w-20" />
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      {/* 7. DEMO MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={locale === 'bn' ? 'অর্ডার প্রিভিউ ও ভেরিফিকেশন' : 'Order Preview & Verification'}
        description={
          locale === 'bn'
            ? 'এটি একটি এক্সেসিবল ডায়ালগ যা এস্কেপ কী ও ব্যাকড্রপ ক্লিকে বন্ধ হয়।'
            : 'Accessible modal dialog supporting keyboard navigation & backdrop dismissal.'
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              {locale === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              {locale === 'bn' ? 'ঠিক আছে' : 'Understood'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            {locale === 'bn'
              ? 'গ্যাজেটবাজারের ফ্রন্টএন্ড ফাউন্ডেশন সফলভাবে Sora এবং Hind Siliguri ফন্ট, টেলউইন্ড টোকেন এবং নেক্সট-ইন্টল বাইলিঙ্গুয়াল সাপোর্ট ইন্টিগ্রেট করেছে।'
              : 'GadgetBazar frontend foundation successfully configured with Sora & Hind Siliguri fonts, design tokens, and next-intl.'}
          </p>
          <div className="p-3 rounded bg-surface-elevated border border-surface-border flex items-center justify-between">
            <span className="text-xs text-gray-400">PWA Manifest Status:</span>
            <Badge variant="success" dot>
              Active
            </Badge>
          </div>
        </div>
      </Modal>

      {/* 8. FOOTER */}
      <footer className="mt-20 border-t border-surface-border bg-surface-card/60 py-8 text-center text-xs text-gray-500 space-y-2 font-sans">
        <p>© 2026 GadgetBazar — China-Import Gadget Marketplace for Bangladesh.</p>
        <p className="text-gray-400">
          {locale === 'bn'
            ? 'আমরা সরাসরি চায়না থেকে কাস্টমস ও এলসি হ্যান্ডেল করি। কোনো লুকানো চার্জ নেই।'
            : 'We handle customs & LC direct from China. Zero hidden fees.'}
        </p>
      </footer>
    </div>
  );
}
