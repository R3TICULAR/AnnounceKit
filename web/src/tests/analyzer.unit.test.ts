/**
 * Unit tests for the analyzer service.
 * Validates: Requirements 2.2, 2.5, 3.2, 3.3, 3.5, 6.3
 */

import { describe, it, expect } from 'vitest';
import {
  runAnalysis,
  runDiffAnalysis,
  validateRoundTrip,
} from '../analyzer.js';
import { ParsingError } from '../browser-parser.js';
import { SelectorError } from '@core/extractor/tree-builder.js';
import { SIZE_LIMIT_BYTES } from '../constants.js';

// ---------------------------------------------------------------------------
// runAnalysis — basic shape
// ---------------------------------------------------------------------------

describe('runAnalysis', () => {
  it('should return a result with one entry for a simple button', () => {
    // Without a selector, buildAccessibilityTree wraps the whole body as a
    // generic container; the button is a child node.
    const result = runAnalysis({ html: '<button>Submit</button>' });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].model).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should include pre-rendered announcements for all three screen readers', () => {
    const result = runAnalysis({ html: '<button>Click me</button>' });
    const { announcements } = result.entries[0];

    expect(typeof announcements.nvda).toBe('string');
    expect(typeof announcements.jaws).toBe('string');
    expect(typeof announcements.voiceover).toBe('string');
    expect(announcements.nvda.length).toBeGreaterThan(0);
    expect(announcements.jaws.length).toBeGreaterThan(0);
    expect(announcements.voiceover.length).toBeGreaterThan(0);
  });

  it('should include a pre-rendered audit report', () => {
    const result = runAnalysis({ html: '<button>Click me</button>' });
    expect(typeof result.entries[0].audit).toBe('string');
    expect(result.entries[0].audit.length).toBeGreaterThan(0);
  });

  it('should include pretty-printed JSON', () => {
    const result = runAnalysis({ html: '<button>Click me</button>' });
    const json = result.entries[0].json;

    expect(() => JSON.parse(json)).not.toThrow();
    // Pretty-printed JSON contains newlines
    expect(json).toContain('\n');
  });

  it('should throw ParsingError for empty HTML', () => {
    expect(() => runAnalysis({ html: '' })).toThrow(ParsingError);
  });

  it('should throw ParsingError for whitespace-only HTML', () => {
    expect(() => runAnalysis({ html: '   \n\t  ' })).toThrow(ParsingError);
  });

  it('should throw ParsingError when HTML exceeds SIZE_LIMIT_BYTES', () => {
    const overLimit = 'a'.repeat(SIZE_LIMIT_BYTES + 1);
    expect(() => runAnalysis({ html: overLimit })).toThrow(ParsingError);
  });

  it('should analyze a full document when no selector is provided', () => {
    const html = `
      <nav><a href="/">Home</a></nav>
      <main><h1>Title</h1><button>Go</button></main>
    `;
    const result = runAnalysis({ html });
    expect(result.entries).toHaveLength(1);
    // Root should be a generic container wrapping the whole body
    expect(result.entries[0].model).toBeDefined();
  });

  it('should collect warnings from the parser and tree builder', () => {
    // Malformed HTML may produce warnings
    const result = runAnalysis({ html: '<button>OK</button>' });
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// runAnalysis — CSS selector filtering
// ---------------------------------------------------------------------------

describe('runAnalysis with cssSelector', () => {
  it('should return one entry per matched element', () => {
    const html = `
      <button>First</button>
      <button>Second</button>
      <button>Third</button>
    `;
    const result = runAnalysis({ html, cssSelector: 'button' });
    expect(result.entries).toHaveLength(3);
  });

  it('should return only the matched element', () => {
    const html = `
      <button class="primary">Primary</button>
      <button class="secondary">Secondary</button>
    `;
    const result = runAnalysis({ html, cssSelector: 'button.primary' });
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].model.root.name).toBe('Primary');
  });

  it('should throw SelectorError when selector matches nothing', () => {
    expect(() =>
      runAnalysis({ html: '<button>OK</button>', cssSelector: '.nonexistent' })
    ).toThrow(SelectorError);
  });

  it('should throw SelectorError with a descriptive message', () => {
    try {
      runAnalysis({ html: '<button>OK</button>', cssSelector: '.nonexistent' });
    } catch (e) {
      expect(e).toBeInstanceOf(SelectorError);
      expect((e as SelectorError).message).toContain('.nonexistent');
    }
  });
});

// ---------------------------------------------------------------------------
// runDiffAnalysis
// ---------------------------------------------------------------------------

describe('runDiffAnalysis', () => {
  it('should return a result with a diff field', () => {
    const result = runDiffAnalysis({
      htmlBefore: '<button>Old label</button>',
      htmlAfter: '<button>New label</button>',
    });

    expect(result.diff).toBeDefined();
    expect(result.diff).not.toBeNull();
  });

  it('should detect a name change as a changed node', () => {
    const result = runDiffAnalysis({
      htmlBefore: '<button>Old label</button>',
      htmlAfter: '<button>New label</button>',
    });

    const changed = result.diff!.changes.filter((c) => c.type === 'changed');
    expect(changed.length).toBeGreaterThan(0);
  });

  it('should return an empty diff for identical HTML', () => {
    const html = '<button>Same</button>';
    const result = runDiffAnalysis({ htmlBefore: html, htmlAfter: html });

    expect(result.diff!.summary.added).toBe(0);
    expect(result.diff!.summary.removed).toBe(0);
    expect(result.diff!.summary.changed).toBe(0);
  });

  it('should detect an added node', () => {
    const result = runDiffAnalysis({
      htmlBefore: '<button>First</button>',
      htmlAfter: '<button>First</button><button>Second</button>',
    });

    const added = result.diff!.changes.filter((c) => c.type === 'added');
    expect(added.length).toBeGreaterThan(0);
  });

  it('should detect a removed node', () => {
    const result = runDiffAnalysis({
      htmlBefore: '<button>First</button><button>Second</button>',
      htmlAfter: '<button>First</button>',
    });

    const removed = result.diff!.changes.filter((c) => c.type === 'removed');
    expect(removed.length).toBeGreaterThan(0);
  });

  it('should include entries from the "after" HTML', () => {
    const result = runDiffAnalysis({
      htmlBefore: '<button>Before</button>',
      htmlAfter: '<button>After</button>',
    });

    // Without a selector, root is a generic body container — just verify entries exist
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].model).toBeDefined();
  });

  it('should throw ParsingError if either input is empty', () => {
    expect(() =>
      runDiffAnalysis({ htmlBefore: '', htmlAfter: '<button>OK</button>' })
    ).toThrow(ParsingError);

    expect(() =>
      runDiffAnalysis({ htmlBefore: '<button>OK</button>', htmlAfter: '' })
    ).toThrow(ParsingError);
  });
});

// ---------------------------------------------------------------------------
// validateRoundTrip
// ---------------------------------------------------------------------------

describe('validateRoundTrip', () => {
  it('should return true for a model produced by runAnalysis', () => {
    const result = runAnalysis({ html: '<button>Test</button>' });
    expect(validateRoundTrip(result.entries[0].model)).toBe(true);
  });

  it('should return true for a complex model', () => {
    const html = `
      <nav aria-label="Main">
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
      <main>
        <h1>Title</h1>
        <button aria-expanded="false">Menu</button>
      </main>
    `;
    const result = runAnalysis({ html });
    expect(validateRoundTrip(result.entries[0].model)).toBe(true);
  });
});
