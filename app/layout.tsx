import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HeroUIProvider } from "@heroui/system"; // <- import HeroUIProvider
import { ThemeProvider } from "./components/ThemeProvider";
import { NewsProvider } from "./context/NewsContext";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Deepfake Detection News Portal",
  description: "Verify news authenticity with AI-powered deepfake detection. Real-time analysis of images and videos.",
  keywords: ["deepfake detection", "news verification", "AI analysis", "video authentication"],
  authors: [{ name: "News Portal Team" }],
  creator: "News Portal",
  publisher: "News Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        {/* Wrap everything with ThemeProvider and HeroUIProvider */}
        <ThemeProvider>
          <AuthProvider>
            <NewsProvider>
              <HeroUIProvider>
                {children}
              </HeroUIProvider>
            </NewsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
