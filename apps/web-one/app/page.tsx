import { Button, EstimateShippingNotice } from '@gadgetbazar/ui';
import { colors } from '@gadgetbazar/design-tokens';

/**
 * NON-NEGOTIABLE RULE:
 * GadgetOne shows NO MOQ, dealer, or group-deal UI. It is purely for single-piece consumer retail.
 */
export default function SinglePieceRetailPage() {
  return (
    <main style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ color: colors.primary.blue, fontSize: '2.5rem', marginBottom: '8px' }}>
          গ্যাজেটওয়ান (GadgetOne)
        </h1>
        <p style={{ color: colors.neutral.midGray, fontSize: '1.125rem' }}>
          একক পিস সরাসরি চীন থেকে রিটেইল অর্ডার
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
        <EstimateShippingNotice estimatedCostBdt="200" weightGrams={250} />

        <div>
          <Button variant="primary">এখনই কিনুন (একক পিস)</Button>
        </div>
      </section>
    </main>
  );
}
