export const metadata = {
  title: 'GadgetBazar — পাইকারি ও গ্রুপ-ডিল গ্যাজেট মার্কেটপ্লেস',
  description: 'চীন থেকে সরাসরি গ্যাজেট আমদানি ও পাইকারি মার্কেটপ্লেস।',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, fontFamily: 'Sora, "Hind Siliguri", sans-serif' }}>{children}</body>
    </html>
  );
}
