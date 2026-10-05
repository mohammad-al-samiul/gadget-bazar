export const metadata = {
  title: 'GadgetTrack — পাবলিক পার্সেল ও শিপমেন্ট ট্র্যাকিং',
  description: 'চীন থেকে বাংলাদেশ পর্যন্ত আপনার গ্যাজেট শিপমেন্টের রিয়েল-টাইম ট্র্যাকিং।',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, fontFamily: 'Sora, "Hind Siliguri", sans-serif' }}>{children}</body>
    </html>
  );
}
