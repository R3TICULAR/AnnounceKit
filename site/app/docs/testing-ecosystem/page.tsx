import Link from 'next/link';

export default function TestingEcosystemPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Testing Ecosystem</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Testing Ecosystem
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          How Speakable fits alongside other accessibility testing tools — and when
          to use each approach.
        </p>
      </header>

      {/* Static vs Runtime */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Static vs Runtime Testing</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Accessibility testing tools fall into two categories. Understanding the difference
          helps you build a testing strategy that catches issues early without sacrificing
          confidence in the final product.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 border border-blue-200 rounded-xl bg-blue-50/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-blue-600" aria-hidden="true">speed</span>
              <h3 className="font-bold text-slate-900">Static Analysis</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Analyzes HTML structure without running a real screen reader. Fast, deterministic,
              runs anywhere. Catches structural issues like missing names, broken heading hierarchy,
              and ARIA problems.
            </p>
            <p className="text-xs text-slate-500">
              Tools: Speakable, axe-core, HTML_CodeSniffer
            </p>
          </div>
          <div className="p-6 border border-teal-200 rounded-xl bg-teal-50/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-teal-600" aria-hidden="true">play_circle</span>
              <h3 className="font-bold text-slate-900">Runtime Testing</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Drives an actual screen reader against a live page. Catches dynamic interaction
              issues, focus management bugs, and live region behavior that static analysis
              can&apos;t see.
            </p>
            <p className="text-xs text-slate-500">
              Tools: Guidepup, manual VoiceOver/NVDA testing
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-bold text-slate-900"></th>
                <th className="py-3 pr-4 font-bold text-slate-900">Static (Speakable)</th>
                <th className="py-3 pr-4 font-bold text-slate-900">Runtime (Guidepup)</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Speed</td>
                <td className="py-3 pr-4">Milliseconds</td>
                <td className="py-3 pr-4">Seconds to minutes</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Setup</td>
                <td className="py-3 pr-4"><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">npm install</code>, runs anywhere</td>
                <td className="py-3 pr-4">OS-specific screen reader required</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">CI/CD</td>
                <td className="py-3 pr-4">Any pipeline (Linux, macOS, Windows)</td>
                <td className="py-3 pr-4">Requires macOS or Windows runners</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Coverage</td>
                <td className="py-3 pr-4">HTML structure, ARIA, names, roles, states</td>
                <td className="py-3 pr-4">Dynamic behavior, focus, live regions</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Accuracy</td>
                <td className="py-3 pr-4">Heuristic (approximation)</td>
                <td className="py-3 pr-4">Ground truth</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Best for</td>
                <td className="py-3 pr-4">Early detection, regression prevention</td>
                <td className="py-3 pr-4">Final validation, complex interactions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Guidepup */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Works Alongside Guidepup</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          <a href="https://github.com/guidepup/guidepup" className="text-blue-600 hover:underline font-medium">Guidepup</a> is
          a runtime screen reader automation library that drives real VoiceOver and NVDA instances
          programmatically. It&apos;s the closest you can get to automated real-user screen reader
          testing.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable and Guidepup solve different problems at different stages:
        </p>
        <div className="space-y-4 mb-6">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Speakable during development</p>
              <p className="text-sm text-slate-600">
                Run <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">speakable page.html -f audit</code> locally
                to catch structural issues before committing. No screen reader setup needed. Runs in milliseconds.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Speakable in CI</p>
              <p className="text-sm text-slate-600">
                Automate regression detection with <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">--diff</code> on
                every PR. Fail builds when screen reader output changes unexpectedly. Works on any CI runner.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-teal-600 font-bold text-lg shrink-0">3.</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Guidepup for validation</p>
              <p className="text-sm text-slate-600">
                Use Guidepup to validate critical user flows where dynamic behavior matters — focus
                management, live regions, keyboard navigation sequences. Requires macOS (VoiceOver)
                or Windows (NVDA) runners.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <p className="text-sm text-teal-800">
            This layered approach catches the majority of screen reader issues through fast static
            analysis, then validates the critical paths with runtime tools where it counts.
          </p>
        </div>
      </section>

      {/* Example workflow */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Combined Workflow Example</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Here&apos;s how a team might use both tools in a GitHub Actions pipeline:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">.github/workflows/a11y.yml</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`name: Accessibility

on: [push, pull_request]

jobs:
  # Fast static checks — runs on any runner
  static-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Speakable audit
        run: npx @reticular/speakable ./dist/index.html -f audit
      - name: Speakable regression check
        run: npx @reticular/speakable ./dist/index.html --diff ./baseline.html

  # Runtime validation — runs on macOS for VoiceOver
  runtime-validation:
    runs-on: macos-latest
    needs: static-analysis  # Only run if static checks pass
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Guidepup VoiceOver tests
        run: npx guidepup test`}
            </pre>
          </div>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          Static analysis runs first on a cheap Linux runner. Runtime validation only runs
          if static checks pass, saving expensive macOS runner minutes for when they&apos;re
          actually needed.
        </p>
      </section>

      {/* When to use what */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">When to Use What</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-blue-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Use Speakable when…</p>
              <p className="text-sm text-slate-600">
                You&apos;re writing components, reviewing PRs, running CI checks, or need fast
                feedback on how screen readers will interpret your HTML structure.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Use Guidepup / real screen readers when…</p>
              <p className="text-sm text-slate-600">
                You need to validate focus management, live region announcements, keyboard
                navigation flows, or any behavior that depends on JavaScript execution and
                real-time DOM updates.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-slate-400 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Use axe-core when…</p>
              <p className="text-sm text-slate-600">
                You need rule-based WCAG violation detection (color contrast, missing alt text,
                form label association). Axe checks rules; Speakable predicts what screen readers
                will actually say.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-20 p-8 rounded-2xl bg-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold mb-2">Ready to set up your pipeline?</h4>
          <p className="text-teal-100">
            See how to integrate Speakable into GitHub Actions and GitLab CI.
          </p>
        </div>
        <Link
          href="/docs/cicd-integration"
          className="bg-white text-teal-700 px-6 py-2 rounded-lg font-bold hover:bg-teal-50 transition-colors whitespace-nowrap"
        >
          CI/CD Setup Guide
        </Link>
      </div>
    </>
  );
}
