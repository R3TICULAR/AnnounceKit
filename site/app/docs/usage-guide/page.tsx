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
          Everything you need to analyze HTML accessibility with Speakable — from installation
          to CI/CD integration.
        </p>
      </header>

      {/* Installation */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Installation</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Install as a project dependency for programmatic use and CI pipelines, or globally for CLI access anywhere.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Install as a project dependency</span>{'\n'}
                <span className="text-blue-400">npm install</span>{' '}
                <span className="text-emerald-400">@reticular/speakable</span>{'\n\n'}
                <span className="text-slate-500"># Or install globally for CLI access</span>{'\n'}
                <span className="text-blue-400">npm install -g</span>{' '}
                <span className="text-emerald-400">@reticular/speakable</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* CLI Commands */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">CLI Commands</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">speakable</code> binary
          accepts HTML file paths as arguments. All options are flags — no subcommands.
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Basic analysis (JSON output, NVDA by default)</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{'\n\n'}
                <span className="text-slate-500"># Choose output format: json, text, audit, or both</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f text</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f json</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f audit</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-f both</span>{'\n\n'}
                <span className="text-slate-500"># Choose screen reader: nvda, jaws, voiceover, or all</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s nvda</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s jaws</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s voiceover</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-s all</span>{'\n\n'}
                <span className="text-slate-500"># Filter to specific elements with a CSS selector</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">--selector &quot;button&quot;</span>{'\n\n'}
                <span className="text-slate-500"># Compare two HTML files (semantic diff)</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">new.html</span>{' '}
                <span className="text-orange-300">--diff old.html</span>{'\n\n'}
                <span className="text-slate-500"># Batch process multiple files</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-orange-300">--batch</span>{' '}
                <span className="text-emerald-400">file1.html file2.html file3.html</span>{'\n\n'}
                <span className="text-slate-500"># Write output to a file</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">-o output.json</span>{'\n\n'}
                <span className="text-slate-500"># Read from stdin</span>{'\n'}
                <span className="text-blue-400">cat</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-slate-300">|</span>{' '}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-orange-300">-</span>{'\n\n'}
                <span className="text-slate-500"># Validate round-trip serialization</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>{' '}
                <span className="text-orange-300">--validate</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Output Formats */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Output Formats</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Speakable supports four output formats, each suited to different workflows.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-bold text-slate-900">Format</th>
                <th className="py-3 pr-4 font-bold text-slate-900">Flag</th>
                <th className="py-3 pr-4 font-bold text-slate-900">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">JSON</td>
                <td className="py-3 pr-4 font-mono">-f json</td>
                <td className="py-3">Canonical accessibility model as deterministic JSON. Best for CI/CD, snapshot testing, and programmatic comparison.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">Text</td>
                <td className="py-3 pr-4 font-mono">-f text</td>
                <td className="py-3">Screen reader announcement text. Shows what each reader would say, line by line. Human-readable.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">Audit</td>
                <td className="py-3 pr-4 font-mono">-f audit</td>
                <td className="py-3">Structured report with landmark structure, heading hierarchy, interactive elements, detected issues (error/warning/info), and summary statistics.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-mono">Both</td>
                <td className="py-3 pr-4 font-mono">-f both</td>
                <td className="py-3">JSON model and screen reader text combined in a single output.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pro Features */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Pro Features</h2>
        <div className="space-y-6">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Batch Processing</h3>
            <p className="text-sm text-slate-600 mb-2">
              Analyze multiple files in a single run. Batch mode continues processing even if
              individual files fail, and reports a summary at the end.
            </p>
            <code className="text-xs font-mono text-slate-500">speakable --batch file1.html file2.html file3.html</code>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Semantic Diff</h3>
            <p className="text-sm text-slate-600 mb-2">
              Compare before/after HTML to detect accessibility regressions. The diff identifies
              added, removed, and changed nodes with property-level detail (name, role, state, focus).
            </p>
            <code className="text-xs font-mono text-slate-500">speakable new.html --diff old.html</code>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">CI/CD Integration</h3>
            <p className="text-sm text-slate-600 mb-2">
              Use exit codes and JSON output for automated pipeline checks. Exit 0 = success,
              exit 1 = user error, exit 2 = content issues or diff changes, exit 3 = system error.
            </p>
            <code className="text-xs font-mono text-slate-500">npx @reticular/speakable page.html -f audit</code>
          </div>
        </div>
      </section>

      {/* Web Analyzer */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Web Analyzer</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The web analyzer at <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">/tool</code> lets
          you paste HTML directly and see results instantly — no installation required.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-slate-600 mb-4">
          <li>Paste your HTML into the textarea</li>
          <li>Select a screen reader (NVDA, JAWS, VoiceOver, or All)</li>
          <li>Optionally enter a CSS selector to focus on specific elements</li>
          <li>Click Analyze to see the predicted output</li>
        </ol>
        <p className="text-slate-600 leading-relaxed">
          Toggle diff mode to compare two HTML snippets side by side. Speakable will show
          you exactly which accessibility tree nodes were added, removed, or changed between
          the two versions.
        </p>
      </section>

      {/* Best Practices */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Best Practices</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">1.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Run in CI for regression detection</p>
              <p className="text-slate-600 text-sm">Add Speakable to your build pipeline so every PR is checked for accessibility changes.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">2.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Use selectors for component-level analysis</p>
              <p className="text-slate-600 text-sm">
                Focus on specific components with <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">--selector</code> rather
                than analyzing entire pages.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">3.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Check all three readers</p>
              <p className="text-slate-600 text-sm">
                Use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">-s all</code> to
                see cross-platform differences. NVDA, JAWS, and VoiceOver each have unique announcement patterns.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">4.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Save JSON baselines for snapshot testing</p>
              <p className="text-slate-600 text-sm">
                Store JSON output as baselines, then use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">--diff</code> to
                detect changes between versions.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-500 font-bold text-lg leading-tight">5.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Start with audit reports</p>
              <p className="text-slate-600 text-sm">
                Use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">-f audit</code> for
                a quick overview of accessibility health before diving into specific reader output.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
