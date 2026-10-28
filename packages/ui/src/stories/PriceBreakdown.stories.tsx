import { PriceBreakdown } from '../components/PriceBreakdown';

export default {
  title: 'Primitives/PriceBreakdown',
  component: PriceBreakdown,
};

export const Stage1CheckoutEstimate = () => (
  <div className="max-w-md">
    <PriceBreakdown
      productPriceBdt={3500}
      estimatedWeightGrams={450}
      shippingRatePerKgBdt={850}
      locale="bn"
    />
  </div>
);

export const Stage2WeighedReadyToPay = () => (
  <div className="max-w-md">
    <PriceBreakdown
      productPriceBdt={3500}
      actualWeightGrams={520}
      actualShippingChargeBdt={442}
      shippingRatePerKgBdt={850}
      stage2Status="ready_to_pay"
      locale="bn"
    />
  </div>
);

export const EnglishVersion = () => (
  <div className="max-w-md">
    <PriceBreakdown
      productPriceBdt={3500}
      estimatedWeightGrams={450}
      shippingRatePerKgBdt={850}
      locale="en"
    />
  </div>
);
