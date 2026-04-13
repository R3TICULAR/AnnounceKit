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
          Speakable processes HTML through a modular pipeline: parse → extract → model → render.
          Each stage is available as a standalone programmatic API via{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">@reticular/speakable</code>,
          or through the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">speakable</code> CLI.
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
          The Parser is the entry point of the pipeline. It takes a raw HTML string and
          returns a parsed DOM document via jsdom with lenient error recovery. Malformed
          HTML is handled gracefully — the parser emits warnings but continues processing.
        </p>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CLI</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Analyze an HTML file (default JSON output)</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">page.html</span>
              </code>
            </pre>
          </div>
        </div>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Programmatic API</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">import</span>{' '}
                <span className="text-slate-300">{'{ '}</span>
                <span className="text-emerald-400">parseHTML</span>
                <span className="text-slate-300">{' }'}</span>
                <span className="text-blue-400"> from</span>{' '}
                <span className="text-orange-300">{`'@reticular/speakable'`}</span>
                <span className="text-slate-300">;</span>{'\n\n'}
                <span className="text-slate-500">// Parse any HTML string — raw snippets, full pages, file contents</span>{'\n'}
                <span className="text-blue-400">const</span>{' '}
                <span className="text-slate-300">{'{ document, warnings }'} = </span>
                <span className="text-emerald-400">parseHTML</span>
                <span className="text-slate-300">(</span>
                <span className="text-orange-300">{`'<button>Submit</button>'`}</span>
                <span className="text-slate-300">);</span>{'\n\n'}
                <span className="text-slate-500">// Or read from a file</span>{'\n'}
                <span className="text-blue-400">import</span>{' '}
                <span className="text-slate-300">{'{ readFileSync }'}</span>
                <span className="text-blue-400"> from</span>{' '}
                <span className="text-orange-300">{`'fs'`}</span>
                <span className="text-slate-300">;</span>{'\n'}
                <span className="text-blue-400">const</span>{' '}
                <span className="text-slate-300">html = </span>
                <span className="text-emerald-400">readFileSync</span>
                <span className="text-slate-300">(</span>
                <span className="text-orange-300">{`'page.html'`}</span>
                <span className="text-slate-300">, </span>
                <span className="text-orange-300">{`'utf-8'`}</span>
                <span className="text-slate-300">);</span>{'\n'}
                <span className="text-blue-400">const</span>{' '}
                <span className="text-slate-300">result = </span>
                <span className="text-emerald-400">parseHTML</span>
                <span className="text-slate-300">(html);</span>
              </code>
            </pre>
          </div>
        </div>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Returns <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">{'{ document, warnings }'}</code> —
          a standard DOM Document and an array of parsing warnings. Lenient mode means even
          severely malformed HTML produces a usable document rather than throwing.
        </p>
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
          The Extractor walks the parsed DOM and builds a canonical accessibility tree.
          It computes accessible names, maps roles, extracts states, and determines
          focusability for every element — following the W3C ARIA specification.
        </p>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Programmatic API</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">import</span>{' '}
                <span className="text-slate-300">{'{'}</span>{'\n'}
                <span className="text-slate-300">{'  '}</span>
                <span className="text-emerald-400">buildAccessibilityTree</span>
                <span className="text-slate-300">,</span>{'\n'}
                <span className="text-slate-300">{'  '}</span>
                <span className="text-emerald-400">buildAccessibilityTreeWithSelector</span>
                <span className="text-slate-300">,</span>{'\n'}
                <span className="text-slate-300">{'  '}</span>
                <span className="text-emerald-400">computeAccessibleName</span>
                <span className="text-slate-300">,</span>{'\n'}
                <span className="text-slate-300">{'  '}</span>
                <span className="text-emerald-400">computeRole</span>
                <span className="text-slate-300">,</span>{'\n'}
                <span className="text-slate-300">{'}'}</span>
                <span className="text-blue-400"> from</span>{' '}
                <span className="text-orange-300">{`'@reticular/speakable'`}</span>
                <span className="text-slate-300">;</span>{'\n\n'}
                <span className="text-slate-500">// Build the full accessibility tree from a DOM element</span>{'\n'}
                <span className="text-blue-400">const</span>{' '}
                <span className="text-slate-300">{'{ model, warnings }'} = </span>
                <span className="text-emerald-400">buildAccessibilityTree</span>
                <span className="text-slate-300">(document.body);</span>{'\n\n'}
                <span className="text-slate-500">// Or filter to specific elements with a CSS selector</span>{'\n'}
                <span className="text-blue-400">const</span>{' '}
                <span className="text-slate-300">results = </span>
                <span className="text-emerald-400">buildAccessibilityTreeWithSelector</span>
                <span className="text-slate-300">(document.body, </span>
                <span className="text-orange-300">{`'button'`}</span>
                <span className="text-slate-300">);</span>
              </code>
            </pre>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Name Computation</h3>
            <p className="text-xs text-slate-500">
              Follows the ARIA name computation algorithm:{' '}
              <code className="text-xs">aria-labelledby</code> → <code className="text-xs">aria-label</code> → native label → <code className="text-xs">alt</code> → text content → <code className="text-xs">title</code>.
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Role Mapping</h3>
            <p className="text-xs text-slate-500">
              Explicit <code className="text-xs">role</code> attribute takes priority, then implicit role
              from the HTML element (e.g. <code className="text-xs">{'<nav>'}</code> → navigation,{' '}
              <code className="text-xs">{'<a href>'}</code> → link).
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">State Extraction</h3>
            <p className="text-xs text-slate-500">
              Extracts ARIA states: expanded, checked (including mixed), pressed, selected,
              disabled, invalid, required, readonly, busy, current, grabbed, hidden, level, posinset, setsize.
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Focus Detection</h3>
            <p className="text-xs text-slate-500">
              Determines focusability from native element type and explicit{' '}
              <code className="text-xs">tabindex</code>. Reports both focusable status and tabindex value.
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
        <p className="text-slate-600 mb-6 leading-relaxed">
          Renderers transform the canonical model into screen reader-specific announcement text.
          Each renderer applies the unique patterns of its target screen reader. Pass an optional{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">colorize</code> boolean
          for ANSI-colored terminal output.
        </p>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Programmatic API</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">import</span>{' '}
                <span className="text-slate-300">{'{ renderNVDA, renderJAWS, renderVoiceOver, renderAuditReport }'}</span>{'\n'}
                <span className="text-blue-400">  from</span>{' '}
                <span className="text-orange-300">{`'@reticular/speakable'`}</span>
                <span className="text-slate-300">;</span>{'\n\n'}
                <span className="text-emerald-400">renderNVDA</span>
                <span className="text-slate-300">(model);          </span>
                <span className="text-slate-500">// plain text</span>{'\n'}
                <span className="text-emerald-400">renderNVDA</span>
                <span className="text-slate-300">(model, </span>
                <span className="text-orange-300">true</span>
                <span className="text-slate-300">);    </span>
                <span className="text-slate-500">// ANSI-colored output</span>{'\n'}
                <span className="text-emerald-400">renderJAWS</span>
                <span className="text-slate-300">(model);          </span>
                <span className="text-slate-500">// JAWS-style output</span>{'\n'}
                <span className="text-emerald-400">renderVoiceOver</span>
                <span className="text-slate-300">(model);     </span>
                <span className="text-slate-500">// VoiceOver-style output</span>{'\n'}
                <span className="text-emerald-400">renderAuditReport</span>
                <span className="text-slate-300">(model);   </span>
                <span className="text-slate-500">// structured audit report</span>
              </code>
            </pre>
          </div>
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

      {/* Model */}
      <section className="mb-16 scroll-mt-24" id="model">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 text-[20px]" aria-hidden="true">
              data_object
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Model</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The canonical <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">AnnouncementModel</code> is
          a deterministic, serializable representation of the accessibility tree. It&apos;s designed for
          snapshot testing, diffing, and CI/CD pipelines.
        </p>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Programmatic API</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">import</span>{' '}
                <span className="text-slate-300">{'{ serializeModel, deserializeModel, validateModel }'}</span>{'\n'}
                <span className="text-blue-400">  from</span>{' '}
                <span className="text-orange-300">{`'@reticular/speakable'`}</span>
                <span className="text-slate-300">;</span>{'\n\n'}
                <span className="text-slate-500">// Serialize to deterministic JSON (sorted keys)</span>{'\n'}
                <span className="text-blue-400">const</span>{' '}
                <span className="text-slate-300">json = </span>
                <span className="text-emerald-400">serializeModel</span>
                <span className="text-slate-300">(model);</span>{'\n\n'}
                <span className="text-slate-500">// Deserialize back with validation</span>{'\n'}
                <span className="text-blue-400">const</span>{' '}
                <span className="text-slate-300">restored = </span>
                <span className="text-emerald-400">deserializeModel</span>
                <span className="text-slate-300">(json);</span>{'\n\n'}
                <span className="text-slate-500">// Validate model structure (throws ValidationError)</span>{'\n'}
                <span className="text-emerald-400">validateModel</span>
                <span className="text-slate-300">(model);</span>
              </code>
            </pre>
          </div>
        </div>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">AnnouncementModel Structure</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`interface AnnouncementModel {
  version: { major: number; minor: number };
  root: AccessibleNode;
  metadata: {
    extractedAt: string;   // ISO 8601 timestamp
    sourceHash?: string;   // hash of source HTML
  };
}

interface AccessibleNode {
  role: AccessibleRole;       // "button", "link", "heading", etc.
  name: string;               // computed accessible name
  description?: string;       // aria-describedby / title
  value?: AccessibleValue;    // form control values
  state: AccessibleState;     // expanded, checked, pressed, etc.
  focus: FocusInfo;           // { focusable, tabindex? }
  children: AccessibleNode[]; // child nodes
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Diff */}
      <section className="mb-16 scroll-mt-24" id="diff">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 text-[20px]" aria-hidden="true">
              compare_arrows
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Diff</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The diff module compares two accessibility trees and returns a structured list of
          added, removed, and changed nodes. Each change includes the specific properties
          that differ (name, role, state, focus). Ideal for regression detection in CI.
        </p>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CLI</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Compare two HTML files</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">new.html</span>{' '}
                <span className="text-orange-300">--diff</span>{' '}
                <span className="text-emerald-400">old.html</span>{'\n\n'}
                <span className="text-slate-500"># Diff with text output</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">new.html</span>{' '}
                <span className="text-orange-300">--diff</span>{' '}
                <span className="text-emerald-400">old.html</span>{' '}
                <span className="text-orange-300">-f text</span>
              </code>
            </pre>
          </div>
        </div>
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Programmatic API</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">import</span>{' '}
                <span className="text-slate-300">{'{ diffAccessibilityTrees }'}</span>
                <span className="text-blue-400"> from</span>{' '}
                <span className="text-orange-300">{`'@reticular/speakable'`}</span>
                <span className="text-slate-300">;</span>{'\n\n'}
                <span className="text-blue-400">const</span>{' '}
                <span className="text-slate-300">diff = </span>
                <span className="text-emerald-400">diffAccessibilityTrees</span>
                <span className="text-slate-300">(oldTree, newTree);</span>{'\n'}
                <span className="text-slate-500">// diff.changes → [{'{ type, path, node?, changes? }'}]</span>{'\n'}
                <span className="text-slate-500">// diff.summary → {'{ added, removed, changed, total }'}</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-20 p-8 rounded-2xl bg-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold mb-2">Need more help?</h4>
          <p className="text-white">
            Join our developer community to share accessibility patterns.
          </p>
        </div>
        <Link
          href="#"
          className="bg-white text-teal-700 px-6 py-2 rounded-lg font-bold hover:bg-teal-50 transition-colors whitespace-nowrap"
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
      'Simulates NVDA speech output. Uses "navigation landmark", "edit" for textboxes, "graphic" for images. States: "not checked", "half checked" (mixed), "unavailable" (disabled).',
  },
  {
    name: 'JAWS',
    borderColor: 'border-slate-300',
    description:
      'Approximates JAWS speech patterns. Uses "navigation region" (vs NVDA\'s "landmark"), "clickable" for links, "check box" (two words). Mixed state: "partially checked".',
  },
  {
    name: 'VoiceOver',
    borderColor: 'border-slate-300',
    description:
      'Tailored for macOS VoiceOver. Announces role before name for headings and landmarks (e.g. "navigation, Main"). Uses "dimmed" for disabled, "edit text" for textboxes.',
  },
  {
    name: 'Audit Report',
    borderColor: 'border-emerald-500',
    description:
      'Generates a structured accessibility report with landmark structure, heading hierarchy validation, interactive element inventory, severity-coded issues (error/warning/info), and summary statistics.',
  },
];
