'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';

interface NavRoute {
  label: string;
  href: string;
}

const PUBLIC_NAV_ROUTES: NavRoute[] = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Analyzer', href: '/tool' },
];

const AUTH_NAV_ROUTES: NavRoute[] = [
  { label: 'Settings', href: '/settings' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const navRoutes = isSignedIn
    ? [...PUBLIC_NAV_ROUTES, ...AUTH_NAV_ROUTES]
    : PUBLIC_NAV_ROUTES;

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (mobileOpen && openedViaKeyboard) {
      firstLinkRef.current?.focus();
      setOpenedViaKeyboard(false);
    }
  }, [mobileOpen, openedViaKeyboard]);

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
            Speakable
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navRoutes.map((route) => (
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
          {!isLoaded ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          ) : isSignedIn ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-slate-600">{user?.firstName || user?.primaryEmailAddress?.emailAddress}</span>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded transition-colors"
              >
                Sign Out
              </button>
              <Link
                href="/tool"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium text-sm transition-all active:scale-95"
              >
                Analyzer
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/sign-up"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium text-sm transition-all active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            ref={toggleRef}
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setOpenedViaKeyboard(true);
              }
            }}
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
        <ul className="border-t border-slate-200 px-6 pb-4 bg-white md:hidden animate-[slideDown_200ms_ease-out]">
          {navRoutes.map((route, index) => (
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
          {!isLoaded ? null : isSignedIn ? (
            <li className="pt-3 mt-3 border-t border-slate-200 flex flex-col gap-2">
              <span className="text-sm text-slate-600 px-2">{user?.firstName || user?.primaryEmailAddress?.emailAddress}</span>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="block w-full text-left rounded px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Sign Out
              </button>
            </li>
          ) : (
            <li className="pt-3 mt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link
                href="/sign-in"
                className="block text-center rounded px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/sign-up"
                className="block text-center rounded px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}
