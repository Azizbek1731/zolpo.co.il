import type { Metadata } from "next";
import { Assistant, Inter } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "זולפה · אוטומציה לעמוד הבית",
  description:
    "Automated WooCommerce homepage for zolpo.co.il — OUTLET banners, best sellers and seasonal rows generated from the catalog.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${assistant.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-white text-zolpo-ink antialiased">
        {children}
      </body>
    </html>
  );
}
