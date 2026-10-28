import { cn } from '../utils/cn';

export interface PriceBreakdownProps {
  productPriceBdt: number;
  estimatedWeightGrams?: number;
  actualWeightGrams?: number | null;
  shippingRatePerKgBdt: number;
  actualShippingChargeBdt?: number | null;
  stage2Status?: 'estimate' | 'ready_to_pay' | 'paid';
  locale?: 'bn' | 'en';
  className?: string;
}

export function PriceBreakdown({
  productPriceBdt,
  estimatedWeightGrams = 0,
  actualWeightGrams,
  shippingRatePerKgBdt,
  actualShippingChargeBdt,
  stage2Status: _stage2Status = 'estimate',
  locale = 'bn',
  className,
}: PriceBreakdownProps): JSX.Element {
  const isWeighed =
    actualWeightGrams !== null && actualWeightGrams !== undefined && actualWeightGrams > 0;
  const weightGrams = isWeighed ? actualWeightGrams : estimatedWeightGrams;
  const weightKg = (weightGrams / 1000).toFixed(2);

  const estimatedShippingCost = Math.round((estimatedWeightGrams / 1000) * shippingRatePerKgBdt);
  const finalShippingCost =
    isWeighed && actualShippingChargeBdt ? actualShippingChargeBdt : estimatedShippingCost;

  return (
    <div
      className={cn(
        'rounded-md border border-surface-border bg-surface-card p-5 font-sans space-y-4 shadow-card',
        className,
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <h4 className="font-sora font-semibold text-sm text-white">
          {locale === 'bn'
            ? 'মূল্য ও পেমেন্ট বিবরণী (২-ধাপ)'
            : 'Cost Breakdown (Two-Stage Payment)'}
        </h4>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-brand-orange-light text-brand-orange border border-brand-orange/30">
          {locale === 'bn' ? 'স্বচ্ছ চায়না-ইমপোর্ট চার্জ' : 'Zero Hidden Fees'}
        </span>
      </div>

      {/* STAGE 1: Product Price (Immediate) */}
      <div className="bg-surface-elevated/60 rounded-base p-3.5 border border-surface-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[11px] text-white font-bold">
              ১
            </span>
            <span className="text-sm font-medium text-white font-sora">
              {locale === 'bn' ? 'ধাপ ১: পণ্যের আসল মূল্য' : 'Stage 1: Product Cost'}
            </span>
          </div>
          <span className="text-sm font-bold font-sora text-brand-blue">
            ৳{productPriceBdt.toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 pl-7">
          {locale === 'bn'
            ? '✓ এখনই চেকআউটে প্রদেয় (সোর্সিং ও কনফার্মেশন)'
            : '✓ Payable immediately at checkout (product sourcing & confirmation)'}
        </p>
      </div>

      {/* STAGE 2: Shipping & Customs (Only after weighing in BD) */}
      <div className="bg-surface-elevated/60 rounded-base p-3.5 border border-surface-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[11px] text-white font-bold">
              ২
            </span>
            <span className="text-sm font-medium text-white font-sora">
              {locale === 'bn' ? 'ধাপ ২: শিপিং ও কাস্টমস' : 'Stage 2: BD Shipping & Customs'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold font-sora text-brand-orange">
              ৳{finalShippingCost.toLocaleString()}
            </span>
            {!isWeighed && (
              <span className="block text-[10px] text-brand-orange font-medium uppercase">
                {locale === 'bn' ? '(আনুমানিক)' : '(Estimated)'}
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 pl-7 space-y-1 text-xs text-gray-300">
          <div className="flex justify-between text-gray-400 text-[11px]">
            <span>{locale === 'bn' ? 'ওজন' : 'Weight'}:</span>
            <span>
              {weightGrams}g ({weightKg} kg) {isWeighed ? '(প্রকৃত ওজন)' : '(আনুমানিক)'}
            </span>
          </div>
          <div className="flex justify-between text-gray-400 text-[11px]">
            <span>{locale === 'bn' ? 'শিপিং রেট' : 'Rate per kg'}:</span>
            <span>৳{shippingRatePerKgBdt}/kg</span>
          </div>
        </div>

        {/* Warning Callout: Non-negotiable business disclaimer */}
        <div className="mt-3 p-2.5 rounded bg-brand-orange/10 border border-brand-orange/30 text-[11px] text-amber-300 flex items-start gap-2">
          <svg
            className="w-4 h-4 text-brand-orange shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {locale === 'bn'
              ? 'শিপিং বিল পণ্য বাংলাদেশে পৌঁছানোর পর মেপে নির্ধারিত হবে। এখন কোনো শিপিং চার্জ দিতে হবে না।'
              : 'Shipping is charged ONLY after physical weighing upon arrival in BD. You pay NO shipping now.'}
          </span>
        </div>
      </div>

      {/* Total Estimated Landing Price */}
      <div className="pt-2 border-t border-surface-border flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 block font-medium">
            {locale === 'bn' ? 'আনুমানিক মোট খরচ' : 'Estimated Total Landing Cost'}
          </span>
          <span className="text-[10px] text-gray-500">
            {locale === 'bn' ? '(পণ্য + কাস্টমস ও শিপিং)' : '(Product + Shipping & Customs)'}
          </span>
        </div>
        <span className="text-lg font-bold font-sora text-white">
          ৳{(productPriceBdt + finalShippingCost).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
