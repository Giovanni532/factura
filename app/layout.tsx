import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "next-themes";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/SEO/JsonLd";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Factura",
  description: "Gérez vos factures, devis et clients avec Factura",
  keywords: ["Factura", "Factures", "Devis", "Clients", "Entreprise", "facturation", "gestion", "facturation en ligne"],
  authors: [{ name: "Giovanni Salcuni" }],
  creator: "Giovanni Salcuni",
  publisher: "Giovanni Salcuni",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL("https://yourdomain.com"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/fr-FR",
    },
  },
  openGraph: {
    title: "Factura",
    description: "Gérez vos factures, devis et clients avec Factura",
    url: "https://yourdomain.com",
    siteName: "Factura",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Factura",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Factura",
    description: "Gérez vos factures, devis et clients avec Factura",
    creator: "@yourtwitter",
    images: ["https://yourdomain.com/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Navbar />
          {children}
          <Toaster />
          <OrganizationJsonLd />
          <WebsiteJsonLd />
        </ThemeProvider>
      </body>
    </html>
  );
}
