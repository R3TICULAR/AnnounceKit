/**
 * Preservation Property Tests — Tab Order on Unaffected Pages
 *
 * These tests verify that tab order on UNAFFECTED pages remains correct.
 * They should PASS on the current unfixed code and continue passing after the fix.
 *
 * Validates: Requirements 3.1, 3.5, 3.6
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// ── Mocks ────────────────────────────────────────────────────────────────

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: false, isLoaded: true }),
  useUser: () => ({ user: null, isLoaded: true }),
  useClerk: () => ({ signOut: vi.fn() }),
  ClerkProvider: ({ children }: any) => children,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// ── Imports (after mocks) ────────────────────────────────────────────────

import LandingPage from '../app/page';
import NotFoundPage from '../app/not-found';
import RootLayout from '../app/layout';
import { Navigation } from '../components/Navigation';

// ── Helper ───────────────────────────────────────────────────────────────

/**
 * Returns the relative DOM order index of an element within a container.
 * Uses a TreeWalker to walk all elements in DOM order and returns the
 * position of the target element.
 */
function getDomOrderIndex(container: HTMLElement, element: HTMLElement): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT);
  let index = 0;
  let node = walker.nextNode();
  while (node) {
    if (node === element) return index;
    index++;
    node = walker.nextNode();
  }
  return -1;
}

// ── Preservation 1: Landing Page ─────────────────────────────────────────
// **Validates: Requirements 3.1**

describe('Preservation — Landing Page', () => {
  it('contains expected interactive elements in correct DOM order', () => {
    const { container } = render(<LandingPage />);

    // Find the key CTA links by their text content
    const allLinks = Array.from(container.querySelectorAll('a'));

    const tryAnalyzer = allLinks.find((a) => a.textContent?.includes('Try the Analyzer'));
    const viewDocs = allLinks.find((a) => a.textContent?.includes('View Documentation'));
    const seePricing = allLinks.find((a) => a.textContent?.includes('See Pricing'));
    const readDocs = allLinks.find((a) => a.textContent?.includes('Read the Docs'));

    // All four CTA links must exist
    expect(tryAnalyzer).toBeTruthy();
    expect(viewDocs).toBeTruthy();
    expect(seePricing).toBeTruthy();
    expect(readDocs).toBeTruthy();

    // Verify DOM order: Try the Analyzer < View Documentation < See Pricing < Read the Docs
    const idxTry = getDomOrderIndex(container, tryAnalyzer!);
    const idxView = getDomOrderIndex(container, viewDocs!);
    const idxPricing = getDomOrderIndex(container, seePricing!);
    const idxRead = getDomOrderIndex(container, readDocs!);

    expect(idxTry).toBeLessThan(idxView);
    expect(idxView).toBeLessThan(idxPricing);
    expect(idxPricing).toBeLessThan(idxRead);
  });

  it('hero CTA links point to correct destinations', () => {
    const { container } = render(<LandingPage />);
    const allLinks = Array.from(container.querySelectorAll('a'));

    const tryAnalyzer = allLinks.find((a) => a.textContent?.includes('Try the Analyzer'));
    const viewDocs = allLinks.find((a) => a.textContent?.includes('View Documentation'));

    expect(tryAnalyzer?.getAttribute('href')).toBe('/tool');
    expect(viewDocs?.getAttribute('href')).toBe('/docs');
  });
});

// ── Preservation 2: 404 Page ─────────────────────────────────────────────
// **Validates: Requirements 3.5**

describe('Preservation — 404 Page', () => {
  it('contains a "Back to Home" link', () => {
    const { container } = render(<NotFoundPage />);

    const allLinks = Array.from(container.querySelectorAll('a'));
    const backHome = allLinks.find((a) => a.textContent?.includes('Back to Home'));

    expect(backHome).toBeTruthy();
    expect(backHome?.getAttribute('href')).toBe('/');
  });

  it('renders the 404 heading', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeTruthy();
  });
});

// ── Preservation 3: Global Skip Link ─────────────────────────────────────
// **Validates: Requirements 3.6**

describe('Preservation — Global Skip Link', () => {
  it('root layout renders a skip link as the first focusable element', () => {
    const { container } = render(
      <RootLayout>
        <div>Page content</div>
      </RootLayout>
    );

    // The skip link should exist with href="#main-content"
    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink).toBeTruthy();
    expect(skipLink?.textContent).toContain('Skip to main content');

    // The skip link should appear before the nav in DOM order
    const nav = container.querySelector('nav[aria-label="Main navigation"]');
    if (nav) {
      const skipIdx = getDomOrderIndex(container, skipLink as HTMLElement);
      const navIdx = getDomOrderIndex(container, nav as HTMLElement);
      expect(skipIdx).toBeLessThan(navIdx);
    }
  });
});

// ── Preservation 4: Navigation Order ─────────────────────────────────────
// **Validates: Requirements 3.6**

describe('Preservation — Navigation Order', () => {
  it('renders nav links in expected order: Home, Pricing, Docs, Analyzer (signed out)', () => {
    const { container } = render(<Navigation />);

    // Get the desktop nav links (inside the ul with hidden md:flex)
    const desktopUl = container.querySelector('ul.hidden.md\\:flex');
    expect(desktopUl).toBeTruthy();

    const links = Array.from(desktopUl!.querySelectorAll('a'));
    const labels = links.map((a) => a.textContent?.trim());

    expect(labels).toEqual(['Home', 'Pricing', 'Docs', 'Analyzer']);
  });

  it('includes Settings link when signed in', async () => {
    // Re-mock useAuth to simulate signed-in state for this test
    const clerkMock = await import('@clerk/nextjs');
    const originalUseAuth = clerkMock.useAuth;
    (clerkMock as any).useAuth = () => ({ isSignedIn: true, isLoaded: true });
    (clerkMock as any).useUser = () => ({
      user: { firstName: 'Test', primaryEmailAddress: { emailAddress: 'test@test.com' } },
      isLoaded: true,
    });

    const { container } = render(<Navigation />);

    const desktopUl = container.querySelector('ul.hidden.md\\:flex');
    expect(desktopUl).toBeTruthy();

    const links = Array.from(desktopUl!.querySelectorAll('a'));
    const labels = links.map((a) => a.textContent?.trim());

    expect(labels).toEqual(['Home', 'Pricing', 'Docs', 'Analyzer', 'Settings']);

    // Restore original mock
    (clerkMock as any).useAuth = originalUseAuth;
  });
});
