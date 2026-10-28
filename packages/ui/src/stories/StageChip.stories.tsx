import { StageChip } from '../components/StageChip';

export default {
  title: 'Primitives/StageChip',
  component: StageChip,
};

export const OrderLifecycleStages = () => (
  <div className="flex flex-wrap gap-2 max-w-xl">
    <StageChip stage="placed" locale="bn" />
    <StageChip stage="product_paid" locale="bn" />
    <StageChip stage="sourcing" locale="bn" />
    <StageChip stage="at_china_wh" locale="bn" />
    <StageChip stage="in_transit" locale="bn" />
    <StageChip stage="arrived_bd" locale="bn" />
    <StageChip stage="weighed_awaiting_shipping_payment" locale="bn" />
    <StageChip stage="shipping_paid" locale="bn" />
    <StageChip stage="out_for_delivery" locale="bn" />
    <StageChip stage="delivered" locale="bn" />
  </div>
);

export const EnglishStages = () => (
  <div className="flex flex-wrap gap-2 max-w-xl">
    <StageChip stage="product_paid" locale="en" />
    <StageChip stage="in_transit" locale="en" />
    <StageChip stage="weighed_awaiting_shipping_payment" locale="en" />
    <StageChip stage="delivered" locale="en" />
  </div>
);

export const KycStages = () => (
  <div className="flex gap-2">
    <StageChip stage="kyc_pending" locale="bn" />
    <StageChip stage="kyc_approved" locale="bn" />
    <StageChip stage="kyc_rejected" locale="bn" />
  </div>
);
