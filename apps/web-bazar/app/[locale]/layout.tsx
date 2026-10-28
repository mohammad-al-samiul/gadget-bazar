import type { Metadata } from 'next';
import { Sora, Hind_Siliguri } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { QueryProvider, ErrorBoundary } from '@gadgetbazar/ui';
import { locales, type Locale } from '../../i18n';
import '../globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GadgetBazar — China-Import Gadget Marketplace for Bangladesh',
  description:
    'China-import gadget marketplace for Bangladesh with group-deals, bulk MOQ, and two-stage transparent payments.',
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${sora.variable} ${hindSiliguri.variable} dark`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1652F0" />
      </head>
      <body className="font-sans bg-surface-ground text-white antialiased selection:bg-brand-blue selection:text-white">
        <QueryProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ErrorBoundary locale={locale as 'bn' | 'en'}>{children}</ErrorBoundary>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
