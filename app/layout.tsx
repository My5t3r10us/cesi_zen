import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/cookies/cookie-consent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CESIZen - Votre compagnon de bien-être mental",
  description: "Application de suivi du bien-être mental pour les citoyens. Suivez vos émotions, accédez à des conseils et prenez soin de votre santé mentale.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CESIZen",
  },
};

export const viewport: Viewport = {
  themeColor: "#8A9A5B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <CookieConsent />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
