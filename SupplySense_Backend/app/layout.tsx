import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ReactQueryProvider from '@/lib/react-query/provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'SupplySense | Enterprise AI Supply Chain Risk & Inventory Intelligence',
  description: 'Real-time telemetry, predictive demand forecasting, vector RAG SOP contract intelligence, and multi-agent supply chain risk management platform.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
