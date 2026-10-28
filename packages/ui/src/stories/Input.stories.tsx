import { Input } from '../components/Input';

export default {
  title: 'Primitives/Input',
  component: Input,
};

export const Default = () => (
  <Input label="গ্রাহকের পুরো নাম (Full Name)" placeholder="মো: রাকিবুল ইসলাম" />
);

export const PhoneWithPrefix = () => (
  <Input label="মোবাইল নম্বর (Phone Number)" placeholder="01712-345678" leftAddon="+880" />
);

export const WithError = () => (
  <Input
    label="ইমেইল (Email)"
    placeholder="user@example.com"
    error="সঠিক ইমেইল ঠিকানা প্রদান করুন"
    defaultValue="invalid-email"
  />
);
