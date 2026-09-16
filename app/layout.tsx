import type { Metadata } from "next";
import { Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import MusicController from "@/components/MusicController";
import VisitTracker from "@/components/VisitTracker";
import SkyrimCursor from "@/components/ui/SkyrimCursor";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Sarah Khodja — Realm of the Builder",
  description: "Portfolio of Sarah Khodja — Software Engineer & Creative Soul from Algeria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${cinzel.variable} ${inter.variable} ${jetbrains.variable} antialiased`}>
        {children}
        <SkyrimCursor />
        <MusicController />
        <VisitTracker />
      </body>
    </html>
  );
}
