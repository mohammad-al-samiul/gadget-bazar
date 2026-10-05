export const metadata = {
  title: 'GadgetX — রাইডার ও ডেলিভারি হাব PWA',
  description: 'ডেলিভারি রাইডারদের জন্য ডেলিভারি টাস্ক ম্যানেজমেন্ট ও প্রুফ-অব-ডেলিভারি।',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, fontFamily: 'Sora, "Hind Siliguri", sans-serif' }}>{children}</body>
    </html>
  );
}
