import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'XPath Extractor Pro — QA Automation Tool',
  description:
    'Extract all unique XPath selectors from any webpage. A production-grade QA automation tool similar to SelectorsHub and Chrome DevTools.',
  keywords: ['xpath', 'xpath extractor', 'selenium', 'qa automation', 'web scraping', 'xpath generator'],
  openGraph: {
    title: 'XPath Extractor Pro',
    description: 'Extract all XPath selectors from any webpage instantly',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
