import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-12 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-6">
              Version 1.0 Now Available
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Preview what screen readers will say — before your users hear it
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
              AnnounceKit simulates how NVDA, JAWS, and VoiceOver interpret
              your HTML, helping you catch screen reader issues early in
              development. Less manual testing overhead, fewer surprises
              in production.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/tool"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg shadow-blue-200 transition-all active:scale-95 text-center"
              >
                Try the Analyzer
              </Link>
              <Link
                href="/docs"
                className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded flex items-center justify-center gap-2 transition-all"
              >
                View Documentation
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="bg-slate-900 rounded-xl shadow-2xl p-4 border border-slate-800 overflow-hidden">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                <div className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true" />
                <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
                <div className="ml-4 text-xs font-mono text-slate-400">analyzer.tsx</div>
              </div>
              <div className="space-y-4 py-4 px-2" role="img" aria-label="Code example showing AnnounceKit predicting NVDA will announce a button as Submit Payment, button">
                <div className="flex gap-4">
                  <span className="text-slate-500 font-mono text-xs">1</span>
                  <code className="text-blue-400 font-mono text-xs">
                    {'<button aria-label="Submit Payment">'}
                  </code>
                </div>
                <div className="flex gap-4 bg-blue-500/10 py-2 border-l-2 border-blue-500">
                  <span className="text-slate-500 font-mono text-xs">2</span>
                  <div className="flex flex-col gap-1">
                    <code className="text-white font-mono text-xs">
                      {'// Predicted Announcement (NVDA)'}
                    </code>
                    <code className="text-green-400 font-mono text-xs">
                      {'"Submit Payment, button"'}
                    </code>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-500 font-mono text-xs">3</span>
                  <code className="text-blue-400 font-mono text-xs">{'</button>'}</code>
                </div>
              </div>
            </div>
            <div
              className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl opacity-50"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Developer-first accessibility tooling
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Go beyond rule-based linting. See how assistive technologies
              actually interpret your markup, and catch issues before they
              reach users.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-xl transition-shadow group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                    {f.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold mb-6">
              <span className="material-symbols-outlined text-xs" aria-hidden="true">
                verified
              </span>
              Enterprise Grade
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Built to support accessibility workflows at scale
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Screen reader usability issues are a leading cause of
              accessibility complaints. AnnounceKit&apos;s CLI integrates
              directly into your CI/CD workflows, helping teams identify
              these issues earlier in development — across your entire
              application.
            </p>
            <ul className="space-y-4 mb-10">
              {ENTERPRISE_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-500" aria-hidden="true">
                    check_circle
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold">High-Fidelity</div>
                <div className="text-slate-400 text-sm">Spec-Aligned Simulation</div>
              </div>
              <div className="h-12 w-px bg-slate-800" aria-hidden="true" />
              <div>
                <div className="text-3xl font-bold">3 Readers</div>
                <div className="text-slate-400 text-sm">NVDA · JAWS · VoiceOver</div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 relative group">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
              <img
                alt="AnnounceKit CLI audit report showing colorized accessibility analysis with landmark structure, heading hierarchy, and issue severity indicators"
                className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                src="/images/cli-colored-output.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">
            Ready to improve your accessibility workflow?
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Catch screen reader issues early, prevent regressions, and build
            better experiences for assistive technology users.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/pricing"
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded shadow-xl shadow-blue-200 transition-all active:scale-95 text-center"
            >
              See Pricing
            </Link>
            <Link
              href="/docs"
              className="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded transition-all active:scale-95 text-center"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const FEATURES = [
  {
    icon: 'devices',
    title: 'Cross-Platform Simulation',
    description:
      'Simulate NVDA, JAWS, and VoiceOver output from a single tool. Reduce reliance on multiple operating systems and hardware devices for screen reader testing.',
  },
  {
    icon: 'assignment_turned_in',
    title: 'Accessibility Audit Reports',
    description:
      'Generate detailed audit reports aligned with WCAG guidance. Each report surfaces landmark issues, heading hierarchy problems, and missing accessible names with actionable remediation steps.',
  },
  {
    icon: 'difference',
    title: 'Semantic Diff',
    description:
      'Compare before and after HTML to catch accessibility regressions early. See how DOM changes affect screen reader output before merging.',
  },
  {
    icon: 'terminal',
    title: 'CI/CD Integration',
    description:
      'Run automated screen reader simulation checks in your build pipeline. Help catch accessibility issues before they reach production.',
  },
];

const ENTERPRISE_POINTS = [
  'Zero-latency local simulation engine',
  'Batch processing across entire codebases',
  'Regression detection via semantic diffing',
];
