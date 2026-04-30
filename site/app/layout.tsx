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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
                <Link href="/privacy" className="text-sm text-slate-500 hover:text-blue-600 transition-colors decoration-2 underline-offset-4">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-slate-500 hover:text-blue-600 transition-colors decoration-2 underline-offset-4">
                  Terms of Service
                </Link>
                <Link href="/security" className="text-sm text-slate-500 hover:text-blue-600 transition-colors decoration-2 underline-offset-4">
                  Security
                </Link>
                <Link href="/contact" className="text-sm text-slate-500 hover:text-blue-600 transition-colors decoration-2 underline-offset-4">
                  Contact
                </Link>
                <a href="https://github.com/R3TICULAR/AnnounceKit" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Speakable on GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </LiveRegionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
