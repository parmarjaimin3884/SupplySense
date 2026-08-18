import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/role-context";
import { NotificationProvider } from "@/context/notification-context";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { AuthHydration } from "@/components/auth/auth-hydration";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-cal-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SupplySense — Enterprise Supply Chain Intelligence & Risk Operations",
  description:
    "SupplySense is an enterprise AI platform that unifies inventory intelligence, stockout prediction, supplier risk monitoring, and operational notifications into a single command center.",
  keywords: [
    "Supply Chain Intelligence",
    "Inventory Risk Management",
    "Stockout Prediction",
    "Supplier Health Scorecard",
    "Demand Forecasting",
    "Notification Center",
  ],
  authors: [{ name: "SupplySense Inc." }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${plusJakartaSans.variable} ${geistMono.variable} font-sans antialiased bg-[#F9FAFB] text-[#111827] selection:bg-[#111827] selection:text-white`}
      >
        <ReactQueryProvider>
          <RoleProvider>
            <NotificationProvider>
              <AuthHydration />
              {children}
            </NotificationProvider>
          </RoleProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
