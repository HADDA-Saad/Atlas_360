import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FooterWrapper from "@/components/FooterWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-[family-name:var(--font-outfit)] bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 flex flex-col min-h-0">
            {children}
          </main>
          <FooterWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
