import { Button } from '../components/Button';

export default {
  title: 'Primitives/Button',
  component: Button,
};

export const Primary = () => <Button variant="primary">কিনুন (Buy Now)</Button>;
export const Secondary = () => <Button variant="secondary">বিস্তারিত দেখুন</Button>;
export const Accent = () => <Button variant="accent">গ্রুপ ডিলে যোগ দিন (Join Deal)</Button>;
export const Outline = () => <Button variant="outline">কার্টে যোগ করুন</Button>;
export const Danger = () => <Button variant="danger">অর্ডার বাতিল</Button>;
export const Loading = () => (
  <Button variant="primary" loading>
    প্রসেসিং হচ্ছে...
  </Button>
);
