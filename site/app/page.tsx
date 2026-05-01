import Link from 'next/link';
import { DiffPreview } from '../components/DiffPreview';
import { CrossPlatformPreview } from '../components/CrossPlatformPreview';
import { ScrollReveal } from '../components/ScrollReveal';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <ScrollReveal>
      <section className="pt-12 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 mb-6">
              Version 1.0 Now Available
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Preview what screen readers will say before your users hear it
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
              Speakable simulates how NVDA, JAWS, and VoiceOver interpret
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
              <div className="space-y-4 py-4 px-2" role="img" aria-label="Code example showing Speakable predicting NVDA will announce a button as Submit Payment, button">
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
      </ScrollReveal>

      {/* Features Grid */}
      <ScrollReveal>
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
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
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
      </ScrollReveal>

      {/* Workflow Section */}
      <ScrollReveal>
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              How Speakable fits into your workflow
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Bridge the gap between code and accessibility by embedding screen reader
              simulation directly into your existing development lifecycle.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" aria-hidden="true" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {WORKFLOW_STEPS.map((step) => (
                <div
                  key={step.title}
                  className="group flex flex-col items-center lg:items-start bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:border-teal-100 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                      {step.icon}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      {step.stage}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed text-center lg:text-left">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DiffPreview />
            </div>
            <div className="bg-teal-600 rounded-3xl p-8 flex flex-col justify-between text-white">
              <div>
                <span className="material-symbols-outlined text-4xl mb-4" aria-hidden="true">bolt</span>
                <h4 className="text-2xl font-bold mb-4">Speed up Reviews</h4>
                <p className="text-teal-50 opacity-90 leading-relaxed">
                  Instead of manual inspection, let Speakable generate a semantic diff.
                  See how the screen reader experience changes between versions.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/docs"
                  className="bg-white text-teal-700 px-6 py-3 rounded-xl font-bold w-full block text-center hover:bg-teal-50 transition-colors"
                >
                  Read the Docs
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
            </div>
            <p className="text-slate-600 text-sm italic text-center md:text-left">
              Speakable complements manual screen reader testing — it doesn&apos;t replace it.
              Use it to catch issues early and reduce the manual testing burden.
            </p>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Enterprise Section */}
      <ScrollReveal>
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-bold mb-6">
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
              accessibility complaints. Speakable&apos;s CLI integrates
              directly into your CI/CD workflows, helping teams identify
              these issues earlier in development — across your entire
              application.
            </p>
            <ul className="space-y-4 mb-10">
              {ENTERPRISE_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-teal-500" aria-hidden="true">
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
                alt="Speakable CLI audit report showing colorized accessibility analysis with landmark structure, heading hierarchy, and issue severity indicators"
                className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                src="/images/cli-colored-output.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Teams Section */}
      <ScrollReveal>
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              {TEAM_FEATURES.map((feature) => (
                <div key={feature.title} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-600 transition-all">
                    <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                      {feature.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative lg:h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-50 rounded-3xl -rotate-2" aria-hidden="true" />
              <div className="relative bg-white p-1 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="ml-4 text-[10px] text-slate-500 font-mono tracking-tight uppercase">
                    Team Dashboard — Production Environment
                  </div>
                </div>
                <div className="p-6 bg-slate-950">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Pass Rate</div>
                      <div className="text-2xl font-bold text-emerald-400">98.2%</div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Total Assets</div>
                      <div className="text-2xl font-bold text-white">4,281</div>
                    </div>
                  </div>
                  <div className="space-y-3" aria-hidden="true">
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-3/4" />
                    </div>
                    <div className="h-2 w-2/3 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-1/2" />
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-5/6" />
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex -space-x-2" aria-hidden="true">
                      <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                      <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">AS</div>
                      <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">+8</div>
                    </div>
                    <div className="text-slate-400 text-xs font-medium">12 active developers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
              Built for teams, not just individuals
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Establish shared accessibility standards and ensure consistent validation
              across your entire engineering organization.
            </p>
            <div className="inline-flex items-center gap-2 text-teal-700 font-bold hover:gap-3 transition-all">
              <Link href="/docs" className="flex items-center gap-2">
                Read the Docs
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Why It Matters Section */}
      <ScrollReveal>
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-teal-50/50 border border-teal-200/30 rounded-3xl p-8 md:p-16 text-center shadow-sm">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl" aria-hidden="true" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-8">
                <span className="material-symbols-outlined text-3xl" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
                Why screen reader issues matter
              </h2>
              <div className="max-w-2xl mx-auto space-y-6">
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                  Screen reader usability issues are among the most common sources of
                  accessibility failures on the web. These issues often go undetected
                  until late in development — or until users report them.
                </p>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed opacity-90">
                  Manual screen reader testing is time-consuming and difficult to scale
                  across large applications. <span className="text-blue-600 font-semibold">Speakable</span> helps
                  teams identify these issues earlier in the development cycle, before
                  they reach production.
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-teal-200/40 max-w-lg mx-auto">
                <p className="text-sm font-medium text-teal-700 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">gavel</span>
                  With growing accessibility expectations under laws like the ADA, early
                  detection isn&apos;t just good practice — it&apos;s risk mitigation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 flex flex-col justify-center border border-slate-200">
            <span className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-4">The Challenge</span>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Manual testing is a bottleneck.</h3>
            <p className="text-slate-600">
              Standard accessibility tools catch syntax, but miss user experience.
              Automated simulation bridges the gap between raw code and real human interaction.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <CrossPlatformPreview />
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Final CTA Section */}
      <ScrollReveal>
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
              className="px-10 py-5 bg-teal-700 hover:bg-teal-800 text-white text-lg font-bold rounded transition-all active:scale-95 text-center"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>
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

const TEAM_FEATURES = [
  {
    icon: 'groups',
    title: 'Shared standards',
    description:
      'Everyone validates against the same simulation. No more "it works on my machine" accessibility discrepancies across different developer environments.',
  },
  {
    icon: 'fact_check',
    title: 'Consistent validation',
    description:
      'Identical checks run locally in the CLI, during PR reviews, and within your CI/CD pipelines for end-to-end reliability.',
  },
  {
    icon: 'shield',
    title: 'Reduced regressions',
    description:
      'Catch screen reader issues before they compound in large codebases. Maintain accessibility health as your engineering org scales.',
  },
  {
    icon: 'account_tree',
    title: 'Workflow integration',
    description:
      'Native support for PR reviews and automated build pipelines with centralized team dashboards for organization-wide visibility.',
  },
];

const WORKFLOW_STEPS = [
  {
    icon: 'terminal',
    stage: 'Stage 01',
    title: 'Local Development',
    description:
      'Run Speakable against your HTML locally to preview screen reader output before committing. Catch issues at the source.',
  },
  {
    icon: 'rebase',
    stage: 'Stage 02',
    title: 'Pull Requests',
    description:
      'Regression detection via semantic diff. Catch accessibility changes in code review before they merge.',
  },
  {
    icon: 'deployed_code',
    stage: 'Stage 03',
    title: 'CI/CD Pipelines',
    description:
      'Automated checks running Speakable in build pipelines, failing builds on regressions to maintain quality.',
  },
  {
    icon: 'monitoring',
    stage: 'Stage 04',
    title: 'Ongoing Monitoring',
    description:
      'Prevent regressions over time. Maintain accessibility standards across every production release.',
  },
];

const ENTERPRISE_POINTS = [
  'Zero-latency local simulation engine',
  'Batch processing across entire codebases',
  'Regression detection via semantic diffing',
];
