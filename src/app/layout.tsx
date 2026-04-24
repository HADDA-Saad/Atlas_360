import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FooterWrapper from "@/components/FooterWrapper";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Atlas 360 — Explore Morocco in 360°",
  description:
    "Discover curated Moroccan travel itineraries and immerse yourself in stunning 360° Street View panoramas of Morocco's most iconic destinations.",
  keywords: ["Morocco", "travel", "360 panorama", "Street View", "itineraries", "Marrakech", "Fes", "Chefchaouen"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-outfit)] bg-[#0F0D0A]">
        <Navbar />
        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>
        <FooterWrapper />
      </body>
    </html>
  );
}
