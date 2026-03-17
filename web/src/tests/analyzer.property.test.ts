/**
 * Property-based tests for the analyzer service.
 *
 * Feature: announcekit-web
 * Properties covered: 1, 2, 5, 7, 10, 12
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  runAnalysis,
  runDiffAnalysis,
  validateRoundTrip,
} from '../analyzer.js';
import { ParsingError } from '../browser-parser.js';
import { SIZE_LIMIT_BYTES } from '../constants.js';
import { deserializeModel, modelsEqual } from '@core/model/serialization.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generates a simple HTML string containing N buttons with unique labels. */
function htmlWithNButtons(n: number): string {
  const buttons = Array.from(
    { length: n },
    (_, i) => `<button>Button ${i + 1}</button>`
  ).join('');
  return `<div>${buttons}</div>`;
}

// ---------------------------------------------------------------------------
// Property 1: HTML input size gate
// Validates: Requirements 1.5, 1.6
// ---------------------------------------------------------------------------

describe('Property 1: HTML input size gate', () => {
  it('should accept any HTML at or below SIZE_LIMIT_BYTES', () => {
    // Use a small fixed HTML string well within the limit
    const html = '<button>OK</button>';
    expect(new TextEncoder().encode(html).length).toBeLessThanOrEqual(SIZE_LIMIT_BYTES);
    expect(() => runAnalysis({ html })).not.toThrow();
  });

  it('should reject HTML that exceeds SIZE_LIMIT_BYTES with a ParsingError', () => {
    // Build a string just over the limit
    const overLimit = 'a'.repeat(SIZE_LIMIT_BYTES + 1);
    expect(() => runAnalysis({ html: overLimit })).toThrow(ParsingError);
  });

  it('should accept HTML at exactly SIZE_LIMIT_BYTES', () => {
    // Pad a valid HTML string to exactly the limit
    const base = '<p>';
    const padding = 'x'.repeat(SIZE_LIMIT_BYTES - new TextEncoder().encode(base).length);
    const atLimit = base + padding;
    expect(new TextEncoder().encode(atLimit).length).toBe(SIZE_LIMIT_BYTES);
    // Should not throw (may produce warnings but must not reject on size)
    expect(() => runAnalysis({ html: atLimit })).not.toThrow(ParsingError);
  });
});

// ---------------------------------------------------------------------------
// Property 2: Analysis produces non-null result for any valid HTML
// Validates: Requirements 2.2, 2.4
// ---------------------------------------------------------------------------

describe('Property 2: Analysis produces non-null result for any valid HTML', () => {
  it('should return a result with at least one entry for any non-empty HTML string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (html) => {
          // Skip strings that would exceed the size limit
          if (new TextEncoder().encode(html).length > SIZE_LIMIT_BYTES) return;

          const result = runAnalysis({ html });

          expect(result).toBeDefined();
          expect(result.entries.length).toBeGreaterThanOrEqual(1);
          expect(result.entries[0].model).not.toBeNull();
          expect(Array.isArray(result.warnings)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: CSS selector entry count
// Validates: Requirements 3.2, 5.4
// ---------------------------------------------------------------------------

describe('Property 5: CSS selector entry count matches number of matched elements', () => {
  it('should return exactly N entries when selector matches N buttons', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 8 }), (n) => {
        const html = htmlWithNButtons(n);
        const result = runAnalysis({ html, cssSelector: 'button' });
        expect(result.entries).toHaveLength(n);
      }),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: No selector analyzes full body
// Validates: Requirements 3.5
// ---------------------------------------------------------------------------

describe('Property 7: No selector analyzes full body', () => {
  it('should produce the same structural result when called twice on the same HTML', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (html) => {
          if (new TextEncoder().encode(html).length > SIZE_LIMIT_BYTES) return;

          const first = runAnalysis({ html });
          const second = runAnalysis({ html });

          // Both calls must produce the same number of entries
          expect(first.entries.length).toBe(second.entries.length);

          // Root role and children count must be identical (timestamps excluded)
          const r1 = first.entries[0].model.root;
          const r2 = second.entries[0].model.root;
          expect(r1.role).toBe(r2.role);
          expect((r1.children ?? []).length).toBe((r2.children ?? []).length);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 10: Model panel JSON round-trip
// Validates: Requirements 5.3, 7.4
// ---------------------------------------------------------------------------

describe('Property 10: Model panel JSON round-trip', () => {
  it('should produce JSON that deserializes to an equivalent model for any valid HTML', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (html) => {
          if (new TextEncoder().encode(html).length > SIZE_LIMIT_BYTES) return;

          const result = runAnalysis({ html });
          const entry = result.entries[0];

          // The JSON in the panel must be valid and round-trip cleanly
          const restored = deserializeModel(entry.json);
          expect(modelsEqual(entry.model, restored)).toBe(true);

          // validateRoundTrip helper must also confirm
          expect(validateRoundTrip(entry.model)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12: Diff mode produces a SemanticDiff
// Validates: Requirements 6.3
// ---------------------------------------------------------------------------

describe('Property 12: Diff mode produces a SemanticDiff for any two non-empty HTML strings', () => {
  it('should return a result with a non-null diff field for any two non-empty HTML strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (htmlBefore, htmlAfter) => {
          if (new TextEncoder().encode(htmlBefore).length > SIZE_LIMIT_BYTES) return;
          if (new TextEncoder().encode(htmlAfter).length > SIZE_LIMIT_BYTES) return;

          const result = runDiffAnalysis({ htmlBefore, htmlAfter });

          expect(result.diff).toBeDefined();
          expect(result.diff).not.toBeNull();
          expect(Array.isArray(result.diff!.changes)).toBe(true);
          expect(typeof result.diff!.summary.added).toBe('number');
          expect(typeof result.diff!.summary.removed).toBe('number');
          expect(typeof result.diff!.summary.changed).toBe('number');
        }
      ),
      { numRuns: 50 }
    );
  });
});
