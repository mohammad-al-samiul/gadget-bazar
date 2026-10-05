export const metadata = {
  title: 'GadgetOne — একক গ্যাজেট রিটেইল শপ',
  description: 'চীন থেকে সরাসরি একক পিস গ্যাজেট কিনুন ঝামেলাহীনভাবে।',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, fontFamily: 'Sora, "Hind Siliguri", sans-serif' }}>{children}</body>
    </html>
  );
}
