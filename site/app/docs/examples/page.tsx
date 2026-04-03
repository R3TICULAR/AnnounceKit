export default function ExamplesPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Examples</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Examples</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Common HTML patterns and their predicted screen reader output.
        </p>
      </header>

      {EXAMPLES.map((ex) => (
        <section key={ex.title} className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{ex.title}</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">{ex.description}</p>
          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed text-blue-400">{ex.html}</pre>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">NVDA Output</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed text-green-400">{ex.output}</pre>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

const EXAMPLES = [
  {
    title: 'Button with aria-label',
    description: 'A button using aria-label overrides the visible text content for screen readers.',
    html: '<button aria-label="Submit payment">Pay now</button>',
    output: '"Submit payment, button"',
  },
  {
    title: 'Navigation landmark',
    description: 'A nav element with aria-label creates a named navigation landmark.',
    html: '<nav aria-label="Main">\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>',
    output: '"Main, navigation\n  Home, link\n  About, link\nend of Main, navigation"',
  },
  {
    title: 'Form with labels',
    description: 'Properly associated labels are announced before the input type.',
    html: '<label for="email">Email address</label>\n<input type="email" id="email" />',
    output: '"Email address, edit, blank"',
  },
];
