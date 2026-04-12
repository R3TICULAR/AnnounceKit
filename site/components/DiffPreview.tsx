/**
 * Styled diff preview component for the landing page.
 * Renders a curated subset of semantic diff output in a terminal-style card.
 */

const DIFF_LINES: Array<{ type: 'header' | 'added' | 'removed' | 'changed' | 'meta'; text: string }> = [
  { type: 'meta', text: '$ speakable diff-after.html --diff diff-before.html' },
  { type: 'header', text: '=== Accessibility Tree Diff ===' },
  { type: 'meta', text: 'Total: 26 changes  +4 added  -10 removed  ~12 changed' },
  { type: 'meta', text: '' },
  { type: 'changed', text: '~ cart link: name "Cart" → "Shopping cart, 3 items"' },
  { type: 'changed', text: '~ heading: level 3 → level 2 (hierarchy fixed)' },
  { type: 'changed', text: '~ image: alt "" → "Black wireless over-ear headphones"' },
  { type: 'changed', text: '~ form: name "" → "Add to cart"' },
  { type: 'changed', text: '~ button: "Add to Cart" → "Add to Cart — $299"' },
  { type: 'changed', text: '~ input: required added' },
  { type: 'added', text: '+ button "Save to wishlist" (new)' },
  { type: 'added', text: '+ link "Accessibility" in footer nav' },
  { type: 'removed', text: '- section "Customer Reviews" lost aria-label' },
  { type: 'removed', text: '- footer nav lost landmark role' },
];

function lineColor(type: string): string {
  switch (type) {
    case 'added': return 'text-emerald-400';
    case 'removed': return 'text-red-400';
    case 'changed': return 'text-amber-300';
    case 'header': return 'text-cyan-400 font-bold';
    case 'meta': return 'text-slate-500';
    default: return 'text-slate-400';
  }
}

function linePrefix(type: string): string {
  switch (type) {
    case 'added': return '+';
    case 'removed': return '-';
    case 'changed': return '~';
    default: return ' ';
  }
}

export function DiffPreview() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800"
      role="img"
      aria-label="Speakable semantic diff output showing 26 accessibility changes: cart link gained descriptive name, heading hierarchy fixed, image alt text added, form labeled, and more"
    >
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border-b border-slate-800">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="ml-3 text-[11px] text-slate-500 font-mono">speakable diff</span>
      </div>

      {/* Diff content */}
      <div className="p-5 overflow-x-auto">
        <pre className="font-mono text-[13px] leading-relaxed">
          {DIFF_LINES.map((line, i) => (
            <div key={i} className={`${lineColor(line.type)} ${line.type === 'meta' && !line.text ? 'h-3' : ''}`}>
              {line.text && (
                <>
                  <span className="select-none opacity-60 mr-2">{linePrefix(line.type)}</span>
                  {line.text}
                </>
              )}
            </div>
          ))}
        </pre>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 px-5 py-3 bg-slate-800/40 border-t border-slate-800 text-xs font-mono">
        <span className="text-emerald-400">+4 added</span>
        <span className="text-red-400">-10 removed</span>
        <span className="text-amber-300">~12 changed</span>
        <span className="ml-auto text-slate-500">diff-before.html → diff-after.html</span>
      </div>
    </div>
  );
}
