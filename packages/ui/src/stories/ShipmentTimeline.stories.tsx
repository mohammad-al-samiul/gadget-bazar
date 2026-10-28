import { ShipmentTimeline } from '../components/ShipmentTimeline';

export default {
  title: 'Primitives/ShipmentTimeline',
  component: ShipmentTimeline,
};

const mockEvents = [
  {
    stage: 'at_china_wh',
    titleBn: 'চীন ওয়্যারহাউসে রিসিভড ও কোয়ালিটি চেক',
    titleEn: 'Received at China Warehouse & Inspected',
    descriptionBn: 'পণ্য ফ্যাক্টরি থেকে সফলভাবে সংগৃহীত ও প্যাকিং সম্পন্ন হয়েছে।',
    timestamp: '24 Oct 2026, 14:30',
    status: 'completed' as const,
  },
  {
    stage: 'in_transit',
    titleBn: 'এয়ার কার্গোতে বাংলাদেশে পথে (ট্রানজিট)',
    titleEn: 'Air Cargo Dispatched to Bangladesh',
    descriptionBn: 'ফ্লাইট নম্বর CZ3051 ঢাকা শাহজালাল আন্তর্জাতিক বিমানবন্দরের পথে রওনা হয়েছে।',
    timestamp: '26 Oct 2026, 09:15',
    status: 'completed' as const,
  },
  {
    stage: 'arrived_bd',
    titleBn: 'বাংলাদেশে পৌঁছেছে এবং কাস্টমস ক্লিয়ারেন্স সম্পন্ন',
    titleEn: 'Arrived in BD & Customs Cleared',
    descriptionBn: 'কাস্টমস ডিউটি ও ছাড়পত্র নিশ্চিত হয়েছে। ওয়্যারহাউসে পৌঁছানো হয়েছে।',
    timestamp: '27 Oct 2026, 17:45',
    status: 'completed' as const,
  },
  {
    stage: 'weighed_awaiting_shipping_payment',
    titleBn: 'ওজন সম্পন্ন — শিপিং বিল প্রদেয় (ধাপ ২)',
    titleEn: 'Weighed & Ready for Shipping Payment (Stage 2)',
    descriptionBn: 'প্রকৃত ওজন: ৪৫০ গ্রাম। চূড়ান্ত শিপিং বিল ৳৩৮২ টাকা প্রদেয়।',
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

export const AirShipmentBengali = () => (
  <div className="max-w-lg bg-surface-card p-6 rounded-md border border-surface-border">
    <ShipmentTimeline events={mockEvents} mode="air" locale="bn" />
  </div>
);

export const AirShipmentEnglish = () => (
  <div className="max-w-lg bg-surface-card p-6 rounded-md border border-surface-border">
    <ShipmentTimeline events={mockEvents} mode="air" locale="en" />
  </div>
);
