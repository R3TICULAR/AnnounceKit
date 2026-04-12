import Link from 'next/link';

export default function ApiReferencePage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-700">API Reference</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          API Reference
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          The Speakable API allows developers to programmatically analyze web
          interfaces and predict screen reader announcements. Use our modular CLI
          and library to integrate accessibility testing directly into your
          development workflow.
        </p>
      </header>

      {/* Parser */}
      <section className="mb-16 scroll-mt-24" id="parser">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 text-[20px]" aria-hidden="true">
              account_tree
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Parser</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The Parser module is the entry point of the Speakable pipeline. It
          ingests raw HTML, DOM trees, or URL endpoints and constructs a semantic
          accessibility tree optimized for screen reader simulation. It handles
          complex ARIA relationships and shadow DOM boundaries automatically.
        </p>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">analyze</span>{' '}
                {'./index.html --engine '}
                <span className="text-orange-300">nvda</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Extractor */}
      <section className="mb-16 scroll-mt-24" id="extractor">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 text-[20px]" aria-hidden="true">
              psychology
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Extractor</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Once the semantic tree is parsed, the Extractor logic applies heuristics
          based on the selected screen reader&apos;s internal algorithms. It calculates
          &ldquo;AccName&rdquo; (Accessible Name) and &ldquo;AccDescription&rdquo; properties,
          determining exactly which text nodes and attributes will be spoken to the user.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Priority Calculation</h3>
            <p className="text-xs text-slate-500">
              Heuristics for aria-labelledby, aria-label, and native labels.
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">State Extraction</h3>
            <p className="text-xs text-slate-500">
              Predicts announcements for expanded, checked, and busy states.
            </p>
          </div>
        </div>
      </section>

      {/* Renderers */}
      <section className="mb-16 scroll-mt-24" id="renderers">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 text-[20px]" aria-hidden="true">
              record_voice_over
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Renderers</h2>
        </div>
        <div className="space-y-8">
          {RENDERERS.map((r) => (
            <div key={r.name} className={`border-l-4 ${r.borderColor} pl-6 py-2`}>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{r.name}</h3>
              <p className="text-slate-600 text-sm">{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-20 p-8 rounded-2xl bg-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold mb-2">Need more help?</h4>
          <p className="text-white">
            Join our developer community to share accessibility patterns.
          </p>
        </div>
        <Link
          href="#"
          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          Join Discord
        </Link>
      </div>
    </>
  );
}

const RENDERERS = [
  {
    name: 'NVDA',
    borderColor: 'border-blue-600',
    description:
      'Simulates the speech output of NonVisual Desktop Access. Focuses on browse mode vs. focus mode transitions.',
  },
  {
    name: 'JAWS',
    borderColor: 'border-slate-300',
    description:
      "Approximates Freedom Scientific's JAWS speech patterns, including verbosity level adjustments.",
  },
  {
    name: 'VoiceOver',
    borderColor: 'border-slate-300',
    description:
      'Tailored for macOS and iOS VoiceOver logic, simulating the rotor navigation experience.',
  },
  {
    name: 'Audit Reports',
    borderColor: 'border-emerald-500',
    description:
      'Generates a JSON or HTML accessibility report summarizing potential "noise" or missing announcements across all engines.',
  },
];
