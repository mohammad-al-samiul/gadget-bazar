import { Button } from '@gadgetbazar/ui';
import { colors } from '@gadgetbazar/design-tokens';

/**
 * SECURITY & RBAC RULE:
 * Riders only see their own assigned tasks.
 * Private delivery proofs and signatures require short-lived signed URLs.
 */
export default function RiderDashboardPage() {
  return (
    <main style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ color: colors.primary.blue, fontSize: '1.75rem', margin: '0 0 8px 0' }}>
          গ্যাজেটএক্স (GadgetX Rider)
        </h1>
        <p style={{ color: colors.neutral.midGray, margin: 0, fontSize: '0.875rem' }}>
          রাইডার ডেলিভারি পোর্টাল (PWA)
        </p>
      </header>

      <div
        style={{
          border: `1px solid ${colors.neutral.lightGray}`,
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', color: colors.neutral.nearBlack }}>
          আজকের ডেলিভারি অ্যাসাইনমেন্ট
        </h3>
        <p style={{ fontSize: '0.875rem', color: colors.neutral.midGray, marginBottom: '16px' }}>
          নিরাপত্তা নীতি অনুযায়ী আপনি শুধুমাত্র আপনার জন্য নির্ধারিত ডেলিভারি দেখতে পারবেন।
        </p>
        <Button variant="primary" style={{ width: '100%' }}>
          ডেলিভারি টাস্ক চেক করুন
        </Button>
      </div>
    </main>
  );
}
