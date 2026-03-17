/**
 * Property-based tests for the browser parser adapter.
 *
 * Feature: announcekit-web, Property 13: Browser parser returns valid ParseResult for any HTML string
 * Validates: Requirements 7.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseHTML } from '../browser-parser.js';

describe('Property 13: Browser parser returns valid ParseResult for any HTML string', () => {
  it('should always return an object with a document and warnings array for any string input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = parseHTML(input);

        // Must always return a result — never throw
        expect(result).toBeDefined();

        // document must be a Document instance
        expect(result.document).toBeDefined();
        expect(result.document).toBeInstanceOf(Document);

        // warnings must be an array
        expect(Array.isArray(result.warnings)).toBe(true);

        // every warning must have a message string
        for (const w of result.warnings) {
          expect(typeof w.message).toBe('string');
          expect(w.message.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should always produce a document with a body for any string input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = parseHTML(input);
        // DOMParser always produces a body (even for empty/non-HTML strings)
        expect(result.document.body).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should never throw for any string input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        expect(() => parseHTML(input)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });
});
