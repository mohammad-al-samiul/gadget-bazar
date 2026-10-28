import React from 'react';
import { cn } from '../utils/cn';

export type StageType =
  // Order stages
  | 'draft'
  | 'placed'
  | 'product_paid'
  | 'sourcing'
  | 'at_china_wh'
  | 'in_transit'
  | 'arrived_bd'
  | 'weighed_awaiting_shipping_payment'
  | 'shipping_paid'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  // KYC stages
  | 'kyc_pending'
  | 'kyc_approved'
  | 'kyc_rejected';

export interface StageChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  stage: StageType | string;
  locale?: 'bn' | 'en';
}

const STAGE_CONFIG: Record<
  string,
  { labelBn: string; labelEn: string; colorClass: string; dotClass: string }
> = {
  draft: {
    labelBn: 'ড্রাফট',
    labelEn: 'Draft',
    colorClass: 'bg-gray-800 text-gray-300 border-gray-700',
    dotClass: 'bg-gray-400',
  },
  placed: {
    labelBn: 'অর্ডার প্লেসড',
    labelEn: 'Order Placed',
    colorClass: 'bg-blue-950/70 text-blue-300 border-blue-800/40',
    dotClass: 'bg-blue-400',
  },
  product_paid: {
    labelBn: 'পণ্যমূল্য পরিশোধিত',
    labelEn: 'Product Paid',
    colorClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40',
    dotClass: 'bg-emerald-400',
  },
  sourcing: {
    labelBn: 'সোর্সিং চলছে',
    labelEn: 'Sourcing in China',
    colorClass: 'bg-purple-950/70 text-purple-300 border-purple-800/40',
    dotClass: 'bg-purple-400',
  },
  at_china_wh: {
    labelBn: 'চীন ওয়্যারহাউসে রিসিভড',
    labelEn: 'At China Warehouse',
    colorClass: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/40',
    dotClass: 'bg-indigo-400',
  },
  in_transit: {
    labelBn: 'বাংলাদেশে পথে (ট্রানজিট)',
    labelEn: 'In Transit to BD',
    colorClass: 'bg-sky-950/70 text-sky-300 border-sky-800/40',
    dotClass: 'bg-sky-400 animate-pulse',
  },
  arrived_bd: {
    labelBn: 'বাংলাদেশে পৌঁছেছে',
    labelEn: 'Arrived in BD',
    colorClass: 'bg-amber-950/70 text-amber-300 border-amber-800/40',
    dotClass: 'bg-amber-400',
  },
  weighed_awaiting_shipping_payment: {
    labelBn: 'ওজন সম্পন্ন — শিপিং বিল প্রদেয়',
    labelEn: 'Weighed: Pay Shipping',
    colorClass: 'bg-orange-950/70 text-orange-400 border-orange-500/40 animate-pulse font-bold',
    dotClass: 'bg-brand-orange',
  },
  shipping_paid: {
    labelBn: 'শিপিং বিল পরিশোধিত',
    labelEn: 'Shipping Paid',
    colorClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40',
    dotClass: 'bg-emerald-400',
  },
  out_for_delivery: {
    labelBn: 'ডেলিভারিতে বের হয়েছে',
    labelEn: 'Out for Delivery',
    colorClass: 'bg-teal-950/70 text-teal-300 border-teal-800/40',
    dotClass: 'bg-teal-400 animate-pulse',
  },
  delivered: {
    labelBn: 'ডেলিভারি সম্পন্ন',
    labelEn: 'Delivered',
    colorClass: 'bg-emerald-900/60 text-emerald-200 border-emerald-600/40',
    dotClass: 'bg-emerald-400',
  },
  cancelled: {
    labelBn: 'বাতিল',
    labelEn: 'Cancelled',
    colorClass: 'bg-red-950/70 text-red-300 border-red-800/40',
    dotClass: 'bg-red-400',
  },
  refunded: {
    labelBn: 'রিফান্ড সম্পন্ন',
    labelEn: 'Refunded',
    colorClass: 'bg-gray-800 text-gray-300 border-gray-600',
    dotClass: 'bg-gray-400',
  },
  kyc_pending: {
    labelBn: 'কেওয়াইসি যাচাই চলছে',
    labelEn: 'KYC Pending',
    colorClass: 'bg-amber-950/70 text-amber-300 border-amber-800/40',
    dotClass: 'bg-amber-400',
  },
  kyc_approved: {
    labelBn: 'কেওয়াইসি ভেরিফাইড',
    labelEn: 'KYC Approved',
    colorClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40',
    dotClass: 'bg-emerald-400',
  },
  kyc_rejected: {
    labelBn: 'কেওয়াইসি বাতিল',
    labelEn: 'KYC Rejected',
    colorClass: 'bg-red-950/70 text-red-300 border-red-800/40',
    dotClass: 'bg-red-400',
  },
};

export function StageChip({
  stage,
  locale = 'bn',
  className,
  ...props
}: StageChipProps): JSX.Element {
  const config = STAGE_CONFIG[stage] || {
    labelBn: stage,
    labelEn: stage,
    colorClass: 'bg-surface-elevated text-gray-300 border-surface-border',
    dotClass: 'bg-gray-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide font-sora select-none',
        config.colorClass,
        className,
      )}
      {...props}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotClass)} />
      <span>{locale === 'bn' ? config.labelBn : config.labelEn}</span>
    </span>
  );
}
