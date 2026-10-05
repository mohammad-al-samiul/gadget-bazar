import { Button, EstimateShippingNotice } from '@gadgetbazar/ui';
import { colors } from '@gadgetbazar/design-tokens';

export default function HomePage() {
  return (
    <main style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ color: colors.primary.blue, fontSize: '2.5rem', marginBottom: '8px' }}>
          গ্যাজেটবাজার (GadgetBazar)
        </h1>
        <p style={{ color: colors.neutral.midGray, fontSize: '1.125rem' }}>
          চীন থেকে বাল্ক, গ্রুপ ডিল ও ডিলার গ্যাজেট মার্কেটপ্লেস
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        <EstimateShippingNotice estimatedCostBdt="350" weightGrams={450} />

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary">গ্রুপ ডিলে অংশ নিন</Button>
          <Button variant="accent">ডিলার অর্ডার করুন</Button>
        </div>
      </section>
    </main>
  );
}
