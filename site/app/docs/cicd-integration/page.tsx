export default function CiCdIntegrationPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">CI/CD Integration</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">CI/CD Integration</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Run Speakable in your build pipeline to catch accessibility regressions on every pull request.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Installation</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Install Speakable as a dev dependency in your project:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">npm install --save-dev speakable</pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">GitHub Actions</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Add this step to your workflow to run accessibility checks on every push:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">.github/workflows/a11y.yml</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`- name: Run Speakable
  run: npx speakable analyze ./dist/index.html --engine all --format json
  
- name: Check for regressions
  run: npx speakable diff ./baseline.json ./current.json --fail-on-change`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">GitLab CI</h2>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">.gitlab-ci.yml</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`accessibility:
  stage: test
  script:
    - npx speakable analyze ./dist/index.html --engine all --format json
    - npx speakable diff ./baseline.json ./current.json --fail-on-change`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Exit Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-bold text-slate-900">Code</th>
                <th className="py-3 pr-4 font-bold text-slate-900">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">0</td>
                <td className="py-3">Analysis completed successfully, no regressions</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">1</td>
                <td className="py-3">Regressions detected (screen reader output changed)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">2</td>
                <td className="py-3">Invalid input (empty HTML, bad selector, file not found)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">JSON Output</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">--format json</code> to
          get machine-readable output for programmatic comparison:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">JSON Output</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`{
  "version": "1.0",
  "root": {
    "role": "button",
    "name": "Submit",
    "state": {},
    "focus": { "focusable": true },
    "children": []
  },
  "metadata": {
    "extractedAt": "2026-04-02T12:00:00Z"
  }
}`}
            </pre>
          </div>
        </div>
      </section>
    </>
  );
}
