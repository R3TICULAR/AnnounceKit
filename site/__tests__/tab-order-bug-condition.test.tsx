/**
 * Bug Condition Exploration Tests — Tab Order Defects
 *
 * These tests encode the EXPECTED (correct) behavior for five tab order defects.
 * They are designed to FAIL on unfixed code, proving the bugs exist.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
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
  usePathname: () => '/docs',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@core/../web/src/analyzer', () => ({
  runAnalysis: vi.fn(),
  runDiffAnalysis: vi.fn(),
}));

vi.mock('@core/../web/src/browser-parser', () => ({
  ParsingError: class ParsingError extends Error {},
}));

vi.mock('@core/extractor/tree-builder', () => ({
  SelectorError: class SelectorError extends Error {},
}));

vi.mock('@core/diff/diff-algorithm', () => ({
  describeChange: vi.fn(),
}));

vi.mock('@core/../web/src/constants', () => ({
  SIZE_LIMIT_BYTES: 5 * 1024 * 1024,
}));

// ── Imports (after mocks) ────────────────────────────────────────────────

import DocsLayout from '../app/docs/layout';
import AnalyzerPage from '../app/tool/page';
import PricingPage from '../app/pricing/page';

// ── Defect 1: Docs Desktop Sidebar ──────────────────────────────────────
// The sidebar <aside> uses `hidden md:block`. The `hidden` class applies
// `display: none` which removes elements from the accessibility tree.
// At desktop, `md:block` overrides it, but the presence of `hidden` in the
// class list is the root of the focusability bug.
//
// **Validates: Requirements 1.1**

describe('Defect 1 — Docs Desktop Sidebar', () => {
  it('sidebar aside should NOT have the "hidden" class that causes display:none', () => {
    const { container } = render(
      <DocsLayout>
        <div>Docs content</div>
      </DocsLayout>
    );

    const aside = container.querySelector('aside');
    expect(aside).toBeTruthy();

    // The bug: aside has `hidden` class which applies display:none at mobile
    // and causes focusability issues. The fix should remove `hidden` and use
    // a responsive approach that doesn't break the accessibility tree.
    // This assertion will FAIL on unfixed code because `hidden` IS present.
    const classNames = aside!.className.split(/\s+/);
    expect(classNames).not.toContain('hidden');
  });

  it('sidebar should contain all expected navigation links', () => {
    const { container } = render(
      <DocsLayout>
        <div>Docs content</div>
      </DocsLayout>
    );

    const aside = container.querySelector('aside');
    expect(aside).toBeTruthy();

    const links = aside!.querySelectorAll('a');
    const linkTexts = Array.from(links).map((l) => l.textContent);

    // Verify all expected sidebar links exist in the DOM
    expect(linkTexts).toContain('API Reference');
    expect(linkTexts).toContain('Usage Guide');
    expect(linkTexts).toContain('Examples');
    expect(linkTexts).toContain('CI/CD Integration');
    expect(linkTexts).toContain('Parser');
    expect(linkTexts).toContain('Extractor');
    expect(linkTexts).toContain('Renderers');
  });
});

// ── Defect 2: Docs Mobile Navigation ────────────────────────────────────
// The DocsLayout provides NO mobile-specific navigation mechanism.
// When the sidebar is hidden at mobile, there's no way to reach docs links.
//
// **Validates: Requirements 1.2**

describe('Defect 2 — Docs Mobile Navigation', () => {
  it('should provide a mobile docs navigation toggle mechanism', () => {
    const { container } = render(
      <DocsLayout>
        <div>Docs content</div>
      </DocsLayout>
    );

    // Look for any button/toggle that could serve as a mobile docs nav trigger.
    // We check for buttons with docs-related labels, details/summary elements,
    // or any element with a role that suggests a toggle for docs navigation.
    const buttons = container.querySelectorAll('button');
    const details = container.querySelectorAll('details');

    const docsNavToggle = Array.from(buttons).find((btn) => {
      const label =
        btn.getAttribute('aria-label')?.toLowerCase() ||
        btn.textContent?.toLowerCase() ||
        '';
      return (
        label.includes('doc') ||
        label.includes('navigation') ||
        label.includes('menu') ||
        label.includes('sidebar')
      );
    });

    // This assertion will FAIL on unfixed code because no mobile docs nav exists.
    expect(docsNavToggle || details.length > 0).toBeTruthy();
  });
});

// ── Defect 3: Tool Page Control Bar Order ───────────────────────────────
// The control bar uses `flex flex-wrap` without explicit `order` classes.
// When flex-wrap causes reflow, visual order can diverge from DOM order.
//
// **Validates: Requirements 1.3**

describe('Defect 3 — Tool Page Control Bar Order', () => {
  it('control bar children should have explicit order classes to prevent reflow reordering', () => {
    const { container } = render(<AnalyzerPage />);

    // Find the flex-wrap control bar container
    const flexWrapContainers = container.querySelectorAll('.flex.flex-wrap');
    expect(flexWrapContainers.length).toBeGreaterThan(0);

    // Get the control bar (the one with items-center and gap-4)
    const controlBar = Array.from(flexWrapContainers).find((el) =>
      el.className.includes('items-center') && el.className.includes('gap-4')
    );
    expect(controlBar).toBeTruthy();

    // Check that children have explicit order classes (order-1, order-2, etc.)
    const children = Array.from(controlBar!.children);
    const hasOrderClasses = children.some((child) => {
      const classes = child.className || '';
      return /\border-\d+\b/.test(classes);
    });

    // This assertion will FAIL on unfixed code because no order classes exist.
    expect(hasOrderClasses).toBe(true);
  });
});

// ── Defect 4: Pricing Page Focus Indicators ─────────────────────────────
// The Pro card has `z-10` which can obscure focus indicators on adjacent
// cards. Adjacent cards lack `focus-within:z-20` or similar to rise above.
//
// **Validates: Requirements 1.4**

describe('Defect 4 — Pricing Page Focus Indicators', () => {
  it('Pro card should have z-10 and adjacent cards should have focus-within:z-20 to prevent obscured focus', () => {
    const { container } = render(<PricingPage />);

    // Find all pricing card containers (the grid children)
    const grid = container.querySelector('.grid.grid-cols-1');
    expect(grid).toBeTruthy();

    const cards = Array.from(grid!.children) as HTMLElement[];
    expect(cards.length).toBe(3);

    // The Pro card (index 1) should have z-10
    const proCard = cards[1];
    expect(proCard.className).toContain('z-10');

    // Adjacent cards (Free and Enterprise) should have focus-within:z-20
    // to ensure their focus indicators aren't obscured by the Pro card's z-10.
    const freeCard = cards[0];
    const enterpriseCard = cards[2];

    const freeHasFocusZ = /focus-within:z-\d+/.test(freeCard.className);
    const enterpriseHasFocusZ = /focus-within:z-\d+/.test(enterpriseCard.className);

    // This assertion will FAIL on unfixed code because no focus-within:z-* exists.
    expect(freeHasFocusZ).toBe(true);
    expect(enterpriseHasFocusZ).toBe(true);
  });
});

// ── Defect 5: Docs Skip Link Target ────────────────────────────────────
// The docs content area does NOT have an `id="docs-content"` attribute,
// and no docs-specific skip link exists targeting it.
//
// **Validates: Requirements 1.5**

describe('Defect 5 — Docs Skip Link Target', () => {
  it('docs content area should have id="docs-content" for skip link targeting', () => {
    const { container } = render(
      <DocsLayout>
        <div>Docs content here</div>
      </DocsLayout>
    );

    // The content div (flex-1 sibling of aside) should have id="docs-content"
    const docsContent = container.querySelector('#docs-content');

    // This assertion will FAIL on unfixed code because no id="docs-content" exists.
    expect(docsContent).toBeTruthy();
  });

  it('should have a docs-specific skip link targeting #docs-content', () => {
    const { container } = render(
      <DocsLayout>
        <div>Docs content here</div>
      </DocsLayout>
    );

    // Look for a skip link that targets #docs-content
    const skipLinks = container.querySelectorAll('a[href="#docs-content"]');

    // This assertion will FAIL on unfixed code because no such skip link exists.
    expect(skipLinks.length).toBeGreaterThan(0);
  });
});
