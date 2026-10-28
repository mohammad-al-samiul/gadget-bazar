import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/Card';
import { Button } from '../components/Button';

export default {
  title: 'Primitives/Card',
  component: Card,
};

export const Standard = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle>হাইড্রোসোনিক আল্ট্রাসনিক ক্লিনার</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-300">
        চায়না সরাসরি কারখানা থেকে আমদানিকৃত প্রিমিয়াম গ্রেড আল্ট্রাসনিক ডিভাইস।
      </p>
    </CardContent>
    <CardFooter className="justify-between">
      <span className="font-bold text-brand-orange text-lg">৳৩,৪৫০</span>
      <Button size="sm">অর্ডার করুন</Button>
    </CardFooter>
  </Card>
);

export const Interactive = () => (
  <Card variant="interactive" className="max-w-sm">
    <CardHeader>
      <CardTitle>ইন্টারেক্টিভ কার্ড</CardTitle>
    </CardHeader>
    <CardContent>
      <p>হোভার করলে বর্ডার গ্লো এবং স্মুথ লিফট এফেক্ট দেখতে পাবেন।</p>
    </CardContent>
  </Card>
);
