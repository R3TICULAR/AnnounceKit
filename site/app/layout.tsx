import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Navigation } from '../components/Navigation';
import { RouteAnnouncer } from '../components/RouteAnnouncer';
import { LiveRegionProvider } from '../components/LiveRegion';
import { AxeDevTools } from '../components/AxeDevTools';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Speakable | Accessibility-First Screen Reader Prediction',
  description: 'Predict screen reader output across NVDA, JAWS, and VoiceOver',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden flex flex-col">
        <ClerkProvider>
        <LiveRegionProvider>
          <AxeDevTools />
          {/* Skip link — first focusable element */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
          >
            Skip to main content
          </a>

          <Navigation />
          <RouteAnnouncer />

          <main id="main-content" className="pt-[73px] flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-slate-50 border-t border-slate-200 w-full py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 max-w-7xl mx-auto">
              <div>
                <div className="text-lg font-bold text-slate-900 mb-4">Speakable</div>
                <p className="text-sm text-slate-500 max-w-xs">
                  © {new Date().getFullYear()} Speakable. Accessibility-first
                  analysis for modern teams. Built for inclusive web design.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end items-center">
                <Link href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors underline decoration-blue-600 decoration-2 underline-offset-4">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors underline decoration-blue-600 decoration-2 underline-offset-4">
                  Terms of Service
                </Link>
                <Link href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors underline decoration-blue-600 decoration-2 underline-offset-4">
                  Security
                </Link>
                <Link href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors underline decoration-blue-600 decoration-2 underline-offset-4">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </LiveRegionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
