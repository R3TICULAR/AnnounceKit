export default function UsageGuidePage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Usage Guide</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Usage Guide</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Learn how to use Speakable to analyze your HTML and predict screen reader output.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Start</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Install Speakable globally via npm, then run it against any HTML file:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`npm install -g speakable
speakable analyze ./my-page.html --engine nvda`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Web Tool</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The web analyzer at <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">/tool</code> lets
          you paste HTML directly and see results instantly. No installation required.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-slate-600">
          <li>Paste your HTML into the textarea</li>
          <li>Select a screen reader (NVDA, JAWS, VoiceOver, or All)</li>
          <li>Optionally enter a CSS selector to focus on specific elements</li>
          <li>Click Analyze to see the predicted output</li>
        </ol>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">CSS Selector Filtering</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Use the CSS selector field to narrow analysis to specific elements. For example,
          entering <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">button.primary</code> will
          only analyze buttons with the &ldquo;primary&rdquo; class.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Diff Mode</h2>
        <p className="text-slate-600 leading-relaxed">
          Toggle diff mode to compare two HTML snippets side by side. Speakable will show
          you exactly which accessibility tree nodes were added, removed, or changed between
          the two versions.
        </p>
      </section>
    </>
  );
}
