/**
 * Cross-platform screen reader comparison component for the landing page.
 * Shows how the same HTML produces different announcements across screen readers.
 */

const READERS = [
  {
    name: 'NVDA',
    platform: 'Windows',
    color: 'blue',
    announcements: [
      'Submit Payment, button',
      'Email, edit, required',
      'Main navigation, navigation landmark',
    ],
  },
  {
    name: 'JAWS',
    platform: 'Windows',
    color: 'slate',
    announcements: [
      'Submit Payment, button',
      'Email, edit, required',
      'Main navigation, navigation region',
    ],
  },
  {
    name: 'VoiceOver',
    platform: 'macOS',
    color: 'teal',
    announcements: [
      'button, Submit Payment',
      'Email, edit text, required',
      'navigation, Main navigation',
    ],
  },
];

const INPUT_HTML = '<button aria-label="Submit Payment">Pay</button>';

function cardBorder(color: string): string {
  switch (color) {
    case 'blue': return 'border-blue-200 hover:border-blue-400';
    case 'teal': return 'border-teal-200 hover:border-teal-400';
    default: return 'border-slate-200 hover:border-slate-400';
  }
}

function badgeBg(color: string): string {
  switch (color) {
    case 'blue': return 'bg-blue-100 text-blue-700';
    case 'teal': return 'bg-teal-100 text-teal-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function dotColor(color: string): string {
  switch (color) {
    case 'blue': return 'bg-blue-500';
    case 'teal': return 'bg-teal-500';
    default: return 'bg-slate-500';
  }
}

export function CrossPlatformPreview() {
  return (
    <div
      className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl"
      role="img"
      aria-label="Three screen readers announcing the same HTML differently: NVDA says Submit Payment button, JAWS says Submit Payment button, VoiceOver says button Submit Payment — demonstrating cross-platform differences"
    >
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border-b border-slate-800">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="ml-3 text-[11px] text-slate-500 font-mono">same HTML, different announcements</span>
      </div>

      {/* Input HTML */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-800/50">
        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Input</div>
        <code className="text-sm font-mono text-blue-400">{INPUT_HTML}</code>
      </div>

      {/* Reader cards */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {READERS.map((reader) => (
          <div
            key={reader.name}
            className={`rounded-xl border ${cardBorder(reader.color)} bg-slate-800/40 p-4 transition-colors`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2.5 h-2.5 rounded-full ${dotColor(reader.color)}`} aria-hidden="true" />
              <span className="text-white font-bold text-sm">{reader.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeBg(reader.color)}`}>
                {reader.platform}
              </span>
            </div>
            <div className="space-y-2">
              {reader.announcements.map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-600 select-none mt-0.5" aria-hidden="true">💬</span>
                  <span className="text-slate-300 text-xs font-mono leading-relaxed">
                    &quot;{line}&quot;
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-800/40 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-500 font-medium">
          Same markup. Three different screen reader experiences. Speakable shows you all of them.
        </p>
      </div>
    </div>
  );
}
