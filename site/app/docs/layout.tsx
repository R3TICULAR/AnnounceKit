'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DOCS_SECTIONS = [
  { label: 'API Reference', href: '/docs' },
  { label: 'Usage Guide', href: '/docs/usage-guide' },
  { label: 'Examples', href: '/docs/examples' },
  { label: 'Common Mistakes', href: '/docs/common-mistakes' },
  { label: 'Framework Guides', href: '/docs/frameworks' },
  { label: 'Spec Integration', href: '/docs/spec-integration' },
  { label: 'Testing Ecosystem', href: '/docs/testing-ecosystem' },
  { label: 'Agentic Commerce', href: '/docs/agentic-commerce' },
  { label: 'CI/CD Integration', href: '/docs/cicd-integration' },
];

const CORE_MODULES = [
  { label: 'Parser', href: '/docs#parser' },
  { label: 'Extractor', href: '/docs#extractor' },
  { label: 'Renderers', href: '/docs#renderers' },
  { label: 'Model', href: '/docs#model' },
  { label: 'Diff', href: '/docs#diff' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/docs') return pathname === '/docs';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-73px)]">
      {/* Docs-specific skip link */}
      <a
        href="#docs-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to docs content
      </a>

      {/* Mobile docs navigation */}
      <div className="md:hidden border-b border-slate-200 bg-slate-50 w-full">
        <button
          type="button"
          aria-expanded={mobileDocsOpen}
          aria-label="Documentation navigation"
          onClick={() => setMobileDocsOpen(!mobileDocsOpen)}
          className="flex items-center justify-between w-full px-6 py-3 text-sm font-semibold text-slate-700"
        >
          <span>Documentation Menu</span>
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            {mobileDocsOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {mobileDocsOpen && (
          <nav aria-label="Documentation navigation" className="px-6 pb-4 space-y-1">
            {DOCS_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                aria-current={isActive(pathname, section.href) ? 'page' : undefined}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive(pathname, section.href)
                    ? 'font-semibold bg-blue-50 text-blue-600'
                    : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {section.label}
              </Link>
            ))}
            <div className="mt-4 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Modules</span>
              <div className="space-y-1 mt-2">
                {CORE_MODULES.map((mod) => (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="block px-3 py-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {mod.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-[250px] bg-slate-50 border-r border-slate-200 max-md:hidden overflow-y-auto sticky top-[73px] h-[calc(100vh-73px)]">
        <div className="p-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
            Documentation
          </h2>
          <nav aria-label="Documentation navigation" className="space-y-1">
            {DOCS_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                aria-current={isActive(pathname, section.href) ? 'page' : undefined}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive(pathname, section.href)
                    ? 'font-semibold bg-blue-50 text-blue-600'
                    : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {section.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Core Modules
            </h3>
            <div className="space-y-1">
              {CORE_MODULES.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="block px-3 py-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {mod.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div id="docs-content" tabIndex={-1} className="flex-1 px-8 py-12 lg:px-16 max-w-4xl">
        {children}
      </div>
    </div>
  );
}
