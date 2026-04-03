'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavRoute {
  label: string;
  href: string;
}

const NAV_ROUTES: NavRoute[] = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Analyzer', href: '/tool' },
  { label: 'Settings', href: '/settings' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { if (mobileOpen) firstLinkRef.current?.focus(); }, [mobileOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    },
    [mobileOpen]
  );

  return (
    <nav
      aria-label="Main navigation"
      onKeyDown={handleKeyDown}
      className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
    >
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
          >
            AnnounceKit
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_ROUTES.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  aria-current={isActive(pathname, route.href) ? 'page' : undefined}
                  className={`transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 ${
                    isActive(pathname, route.href)
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/tool"
            className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium text-sm transition-all active:scale-95"
          >
            Get Started
          </Link>

          {/* Mobile toggle */}
          <button
            ref={toggleRef}
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded p-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <ul className="border-t border-slate-200 px-6 pb-4 bg-white md:hidden">
          {NAV_ROUTES.map((route, index) => (
            <li key={route.href}>
              <Link
                ref={index === 0 ? firstLinkRef : undefined}
                href={route.href}
                aria-current={isActive(pathname, route.href) ? 'page' : undefined}
                className={`block rounded px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  isActive(pathname, route.href)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
