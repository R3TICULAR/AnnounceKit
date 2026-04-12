'use client';

import { useState, useRef, useCallback } from 'react';
import {
  runAnalysis,
  runDiffAnalysis,
  type AnalysisResult,
  type ScreenReaderOption,
} from '@core/../web/src/analyzer';
import { ParsingError } from '@core/../web/src/browser-parser';
import { SelectorError } from '@core/extractor/tree-builder';
import { describeChange } from '@core/diff/diff-algorithm';
import { SIZE_LIMIT_BYTES } from '@core/../web/src/constants';

type TabId = 'announcements' | 'audit' | 'json' | 'diff';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'announcements', label: 'Announcements' },
  { id: 'audit', label: 'Audit Report' },
  { id: 'json', label: 'JSON Model' },
  { id: 'diff', label: 'Semantic Diff' },
];

export default function AnalyzerPage() {
  const [html, setHtml] = useState('');
  const [htmlBefore, setHtmlBefore] = useState('');
  const [screenReader, setScreenReader] = useState<ScreenReaderOption>('NVDA');
  const [cssSelector, setCssSelector] = useState('');
  const [diffMode, setDiffMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('announcements');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = useCallback(() => {
    setError(null);
    if (!html.trim()) { setError('HTML input is required.'); return; }
    if (diffMode && !htmlBefore.trim()) { setError('Before HTML is required in diff mode.'); return; }

    setLoading(true);
    try {
      const r = diffMode
        ? runDiffAnalysis({ htmlBefore, htmlAfter: html, cssSelector: cssSelector || undefined })
        : runAnalysis({ html, cssSelector: cssSelector || undefined });
      setResult(r);
      setActiveTab(diffMode ? 'diff' : 'announcements');
    } catch (err) {
      if (err instanceof ParsingError || err instanceof SelectorError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError('An unexpected error occurred. Please try again.');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [html, htmlBefore, cssSelector, diffMode]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > SIZE_LIMIT_BYTES) {
      setError(`File exceeds the ${SIZE_LIMIT_BYTES / (1024 * 1024)} MB limit.`);
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'html' && ext !== 'htm') {
      setError('Only .html and .htm files are accepted.');
      return;
    }
    file.text().then((text) => { setHtml(text); setError(null); });
  }, []);

  // Derive panel content from result + screenReader
  const panelContent = getPanelContent(activeTab, result, screenReader);

  return (
    <div className="pb-12 px-6">
      <div className="max-w-7xl mx-auto">
      <header className="mb-10 pt-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Accessibility Analyzer</h1>
        <p className="text-lg text-gray-600">Paste or upload HTML to see how screen readers will announce it.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
              <label htmlFor="html-input" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {diffMode ? 'After (new HTML)' : 'HTML Input'}
              </label>
              <div className="flex gap-2" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <textarea
              id="html-input"
              className="w-full h-[300px] p-4 font-mono text-sm bg-gray-50 border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400"
              placeholder="Paste your HTML here..."
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />

            {diffMode && (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-t border-b border-gray-200 bg-white">
                  <label htmlFor="html-before" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Before (original HTML)
                  </label>
                </div>
                <textarea
                  id="html-before"
                  className="w-full h-[200px] p-4 font-mono text-sm bg-gray-50 border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400"
                  placeholder="Paste the original HTML here..."
                  value={htmlBefore}
                  onChange={(e) => setHtmlBefore(e.target.value)}
                />
              </>
            )}

            {/* Control Bar */}
            <div className="p-4 border-t border-gray-200 bg-white space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <input ref={fileInputRef} type="file" accept=".html,.htm" className="hidden" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="order-1 inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">upload</span>
                  Upload .html file
                </button>
                <div className="order-2 flex flex-col">
                  <label htmlFor="sr-select" className="sr-only">Screen reader</label>
                  <select id="sr-select" className="text-sm border border-gray-300 ring-1 ring-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10"
                    value={screenReader} onChange={(e) => setScreenReader(e.target.value as ScreenReaderOption)}>
                    <option value="NVDA">NVDA</option>
                    <option value="JAWS">JAWS</option>
                    <option value="VoiceOver">VoiceOver</option>
                    <option value="All">All</option>
                  </select>
                </div>
                <div className="order-3 flex-grow">
                  <label htmlFor="css-selector" className="sr-only">CSS selector</label>
                  <input id="css-selector" type="text" className="w-full text-sm border border-gray-300 ring-1 ring-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    placeholder="e.g. button, .my-class" value={cssSelector} onChange={(e) => setCssSelector(e.target.value)} />
                </div>
                <div className="order-4 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600" id="diff-label">Diff mode</span>
                  <button type="button" role="switch" aria-checked={diffMode} aria-labelledby="diff-label"
                    onClick={() => setDiffMode(!diffMode)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${diffMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${diffMode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleAnalyze} disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-busy={loading}>
                  <span className="material-symbols-outlined" aria-hidden="true">analytics</span>
                  {loading ? 'Analyzing…' : 'Analyze'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex items-start gap-3" role="alert">
              <span className="material-symbols-outlined text-red-600" aria-hidden="true">error</span>
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Warnings Area */}
          {result && result.warnings.length > 0 ? (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600" aria-hidden="true">warning</span>
              <div className="text-sm text-amber-800">
                <span className="font-semibold">{result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}:</span>
                <ul className="mt-1 list-disc list-inside">
                  {result.warnings.map((w, i) => <li key={i}>{w.message}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600" aria-hidden="true">warning</span>
              <div className="text-sm text-amber-800">
                <span className="font-semibold">Parser Status:</span> No issues detected. Ready to analyze.
              </div>
            </div>
          )}
        </section>

        {/* Results Section */}
        <section className="lg:col-span-5 flex flex-col" aria-busy={loading}>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
            <div className="flex border-b border-gray-200 bg-gray-50/50" role="tablist" aria-label="Analysis results">
              {TABS.map((tab) => {
                if (tab.id === 'diff' && !diffMode) return null;
                return (
                  <button key={tab.id} role="tab" id={`tab-${tab.id}`}
                    aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'font-semibold border-b-2 border-blue-600 text-blue-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}>
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-100">
              <span className="text-xs font-mono text-gray-500">{activeTab}</span>
              <div className="flex gap-2">
                <button type="button"
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all flex items-center justify-center leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  style={{ opacity: result ? 1 : 0.4, cursor: result ? 'pointer' : 'not-allowed' }}
                  aria-label="Copy to clipboard" aria-disabled={!result}
                  onClick={() => { if (result) navigator.clipboard.writeText(panelContent); }}>
                  <span className="material-symbols-outlined text-[18px] leading-none block" aria-hidden="true">content_copy</span>
                </button>
                <button type="button"
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all flex items-center justify-center leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  style={{ opacity: result ? 1 : 0.4, cursor: result ? 'pointer' : 'not-allowed' }}
                  aria-label="Download output" aria-disabled={!result}
                  onClick={() => { if (result) downloadText(panelContent, `${activeTab}.txt`); }}>
                  <span className="material-symbols-outlined text-[18px] leading-none block" aria-hidden="true">download</span>
                </button>
              </div>
            </div>

            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}
              className="bg-gray-900 flex-grow p-6 overflow-auto min-h-[300px]">
              <pre className="font-mono text-sm leading-relaxed text-green-400 whitespace-pre-wrap">
                {result
                  ? panelContent || '(empty)'
                  : <><span className="text-gray-400 select-none">{'// Awaiting analysis...\n'}</span><span className="text-gray-300">Paste HTML and click Analyze to see results.</span></>
                }
              </pre>
            </div>

            <div className="p-4 bg-teal-50 border-t border-teal-100">
              <div className="flex gap-2 items-center text-xs text-teal-700">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">lightbulb</span>
                <span>Tip: Use CSS selectors to focus analysis on specific elements.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function getPanelContent(tab: TabId, result: AnalysisResult | null, sr: ScreenReaderOption): string {
  if (!result) return '';
  const entries = result.entries;

  switch (tab) {
    case 'announcements': {
      return entries.map((e, i) => {
        const prefix = entries.length > 1 ? `=== Element ${i + 1} ===\n` : '';
        if (sr === 'All') {
          return prefix + [
            `--- NVDA ---\n${e.announcements.nvda}`,
            `--- JAWS ---\n${e.announcements.jaws}`,
            `--- VoiceOver ---\n${e.announcements.voiceover}`,
          ].join('\n\n');
        }
        const map: Record<ScreenReaderOption, string> = {
          NVDA: e.announcements.nvda,
          JAWS: e.announcements.jaws,
          VoiceOver: e.announcements.voiceover,
          All: '',
        };
        return prefix + map[sr];
      }).join('\n\n');
    }
    case 'audit':
      return entries.map((e) => e.audit).join('\n\n---\n\n');
    case 'json':
      return entries.map((e) => e.json).join('\n\n---\n\n');
    case 'diff': {
      if (!result.diff) return 'No diff available.';
      if (result.diff.changes.length === 0) return 'No changes detected.';
      const header = `+${result.diff.summary.added} added  -${result.diff.summary.removed} removed  ~${result.diff.summary.changed} changed\n\n`;
      return header + result.diff.changes.map((c) => {
        const prefix = c.type === 'added' ? '+ ' : c.type === 'removed' ? '- ' : '~ ';
        return prefix + describeChange(c);
      }).join('\n');
    }
    default:
      return '';
  }
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
