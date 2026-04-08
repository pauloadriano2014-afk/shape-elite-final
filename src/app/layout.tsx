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

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Shape Elite | Paulo Adriano Team",
  description: "Aplicativo exclusivo de acompanhamento, dieta e alta performance.",
  manifest: "/manifest.json",
  // FORÇA O FAVICON A SER A SUA LOGO:
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
        // GATILHO V3 PARA QUEBRAR O CACHE DO WHATSAPP DE VEZ
        url: 'https://shapeelitefinal.vercel.app/logo.png?v=3', 
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
    <html lang="pt-BR" className="antialiased bg-slate-950">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('PWA ServiceWorker registrado');
                  }, function(err) {
                    console.log('Falha no registro do PWA: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 overscroll-none touch-none`}
      >
        {children}
      </body>
    </html>
  );
}