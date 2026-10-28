import { Toast } from '../components/Toast';

export default {
  title: 'Primitives/Toast',
  component: Toast,
};

export const Success = () => (
  <Toast
    type="success"
    title="পেমেন্ট সফল হয়েছে!"
    message="ধাপ ১ সম্পন্ন। আপনার পণ্যটি সফলভাবে বুকিং করা হয়েছে।"
    onDismiss={() => {}}
  />
);

export const Warning = () => (
  <Toast
    type="warning"
    title="শিপিং বিল বাকি"
    message="পণ্যটি ওজন করা হয়েছে। অনুগ্রহ করে ডেলিভারির পূর্বে ধাপ ২ শিপিং বিল পরিশোধ করুন।"
    onDismiss={() => {}}
  />
);

export const ErrorToast = () => (
  <Toast
    type="error"
    title="পেমেন্ট ব্যর্থ হয়েছে"
    message="ব্যাংক থেকে লেনদেন সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"
    onDismiss={() => {}}
  />
);
