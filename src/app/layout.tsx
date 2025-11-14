import './globals.css';
// import { Inter } from 'next/font/google'; // PASO 1: Comentamos esto
import { ClientLayoutWrapper } from '@/components/layout/client-layout-wrapper';
import type { Metadata } from 'next';
import Script from 'next/script';

// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' }); // PASO 2: Comentamos esto

export const metadata: Metadata = {
  title: 'SchoIA+',
  description: 'Planifica tu avance académico de forma visual e interactiva con IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="no-scrollbar">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1939873592245626"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* PASO 3: Agregamos estos links para cargar la fuente Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />

      </head>
      {/* PASO 4: Quitamos la variable de 'inter' del className */}
      <body className="font-body antialiased">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}