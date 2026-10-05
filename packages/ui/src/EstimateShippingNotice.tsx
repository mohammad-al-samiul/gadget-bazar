import { colors } from '@gadgetbazar/design-tokens';

export interface EstimateShippingNoticeProps {
  estimatedCostBdt: string | number;
  weightGrams?: number;
}

/**
 * NON-NEGOTIABLE RULE:
 * Shipping charge shown on product pages is strictly an ESTIMATE and must be labelled as such.
 * Actual charge is confirmed only after goods arrive in Bangladesh and are weighed.
 */
export function EstimateShippingNotice({
  estimatedCostBdt,
  weightGrams,
}: EstimateShippingNoticeProps): JSX.Element {
  return (
    <div
      style={{
        border: `1px solid ${colors.accent.orange}`,
        backgroundColor: colors.accent.orangeLight,
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '0.875rem',
        color: colors.neutral.nearBlack,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
        <span
          style={{
            backgroundColor: colors.accent.orange,
            color: colors.neutral.white,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.75rem',
          }}
        >
          আনুমানিক / ESTIMATE
        </span>
        <span>শিপিং চার্জ: ৳{estimatedCostBdt}</span>
      </div>
      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: colors.neutral.midGray }}>
        {weightGrams ? `আনুমানিক ওজন: ${weightGrams}g। ` : ''}
        চূড়ান্ত শিপিং চার্জ পণ্য বাংলাদেশে আসার পর ডিজিটাল স্কেলে ওজন মেপে নির্ধারণ করা হবে।
      </p>
    </div>
  );
}
