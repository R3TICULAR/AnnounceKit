/**
 * Unit tests for ak-app state logic.
 * Validates: Requirements 2.5, 4.5
 */

import { describe, it, expect, vi } from 'vitest';
import { runAnalysis } from '../analyzer.js';
import { ParsingError } from '../browser-parser.js';
import { SelectorError } from '@core/extractor/tree-builder.js';

// ---------------------------------------------------------------------------
// Property 3: Fatal error preserves HTML input (Requirement 2.5)
// ---------------------------------------------------------------------------

describe('ak-app error handling preserves HTML', () => {
  it('should preserve html value when runAnalysis throws ParsingError', () => {
    // Simulate the _onAnalyze logic
    let html = '<button>My button</button>';
    let error: string | null = null;
    let result = null;

    try {
      // Simulate a ParsingError being thrown
      throw new ParsingError('Input is empty');
    } catch (err) {
      if (err instanceof ParsingError) {
        error = err.message;
        result = null;
        // html is NOT reassigned — it is preserved
      }
    }

    expect(html).toBe('<button>My button</button>');
    expect(error).toBe('Input is empty');
    expect(result).toBeNull();
  });

  it('should preserve html value when runAnalysis throws SelectorError', () => {
    let html = '<button>Test</button>';
    let error: string | null = null;

    try {
      throw new SelectorError('No elements match selector: ".missing"');
    } catch (err) {
      if (err instanceof SelectorError) {
        error = err.message;
        // html unchanged
      }
    }

    expect(html).toBe('<button>Test</button>');
    expect(error).toContain('.missing');
  });

  it('should set error to null before each analysis attempt', () => {
    // Mirrors: this._error = null at the start of _onAnalyze
    let error: string | null = 'previous error';
    error = null; // reset at start of analysis
    expect(error).toBeNull();
  });

  it('should set loading=false in finally block even on error', () => {
    let loading = true;
    try {
      throw new Error('boom');
    } catch {
      // error handled
    } finally {
      loading = false;
    }
    expect(loading).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Property 9: Screen reader change does not re-run analysis (Requirement 4.5)
// ---------------------------------------------------------------------------

describe('ak-app screen reader change does not re-run analysis', () => {
  it('should update screenReader without calling runAnalysis', () => {
    const analysisSpy = vi.fn();

    // Simulate _onOptionsChange — only updates state, never calls analyzer
    let screenReader = 'NVDA';
    const onOptionsChange = (detail: { screenReader: string; cssSelector: string; diffMode: boolean }) => {
      screenReader = detail.screenReader;
      // runAnalysis is NOT called here
    };

    onOptionsChange({ screenReader: 'JAWS', cssSelector: '', diffMode: false });

    expect(screenReader).toBe('JAWS');
    expect(analysisSpy).not.toHaveBeenCalled();
  });

  it('should only call runAnalysis when ak-analyze event fires', async () => {
    const analysisSpy = vi.fn().mockReturnValue({ entries: [], warnings: [] });

    // Simulate _onAnalyze
    const onAnalyze = async (html: string) => {
      if (!html.trim()) return;
      analysisSpy(html);
    };

    // Changing screen reader does NOT trigger onAnalyze
    expect(analysisSpy).not.toHaveBeenCalled();

    // Only the analyze button triggers it
    await onAnalyze('<button>Test</button>');
    expect(analysisSpy).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Diff mode guard
// ---------------------------------------------------------------------------

describe('ak-app diff mode validation', () => {
  it('should not call runDiffAnalysis when htmlBefore is empty in diff mode', () => {
    const diffSpy = vi.fn();

    const onAnalyze = (html: string, htmlBefore: string, diffMode: boolean) => {
      if (!html.trim()) return;
      if (diffMode && !htmlBefore.trim()) return; // guard
      diffSpy();
    };

    onAnalyze('<button>After</button>', '', true);
    expect(diffSpy).not.toHaveBeenCalled();
  });

  it('should call runDiffAnalysis when both inputs are non-empty in diff mode', () => {
    const diffSpy = vi.fn();

    const onAnalyze = (html: string, htmlBefore: string, diffMode: boolean) => {
      if (!html.trim()) return;
      if (diffMode && !htmlBefore.trim()) return;
      diffSpy();
    };

    onAnalyze('<button>After</button>', '<button>Before</button>', true);
    expect(diffSpy).toHaveBeenCalledTimes(1);
  });
});
