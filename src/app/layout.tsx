import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// CONFIGURAÇÃO DE VIEWPORT PARA PWA (IMPEDE ZOOM INDESEJADO E OCUPA TELA TODA)
export const viewport: Viewport = {
  themeColor: "#0f172a", // Corrigido para o Preto Slate Elite (combina com o topo do App)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// METADADOS DE ELITE PARA RECONHECIMENTO COMO APP E LINKS (WHATSAPP)
export const metadata: Metadata = {
  title: "Shape Elite | Paulo Adriano Team",
  description: "Aplicativo exclusivo de acompanhamento, dieta e alta performance.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shape Elite",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Shape Elite | Paulo Adriano Team',
    description: 'Aplicativo exclusivo de acompanhamento, dieta e alta performance.',
    url: 'https://shapeelitefinal.vercel.app/',
    siteName: 'Shape Elite',
    images: [
      {
        url: '/logo.png', // Puxa a sua logo bonita pra miniatura do WhatsApp
        width: 800,
        height: 800,
        alt: 'Shape Elite Logo',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="antialiased">
      <head>
        {/* TAGS ADICIONAIS PARA FORÇAR MODO STANDALONE NO IOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}