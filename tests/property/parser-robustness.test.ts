/**
 * Property-based tests for parser robustness.
 * 
 * Feature: speakable-cli
 * Property 1: Parser Robustness
 * Validates: Requirements 1.1, 1.3
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseHTML, ParsingError } from '../../src/parser/html-parser.js';

/**
 * Generate arbitrary HTML strings (valid and malformed).
 */
const arbitraryHTML = (): fc.Arbitrary<string> => {
  return fc.oneof(
    // Valid HTML
    fc.constant('<!DOCTYPE html><html><body><button>Click</button></body></html>'),
    fc.constant('<div>Hello</div>'),
    fc.constant('<p>Text</p>'),
    
    // Malformed HTML - unclosed tags
    fc.constant('<div><p>Unclosed'),
    fc.constant('<button>No closing tag'),
    
    // Malformed HTML - invalid nesting
    fc.constant('<p><div>Invalid nesting</div></p>'),
    fc.constant('<ul><div>Should be li</div></ul>'),
    
    // Empty or minimal
    fc.constant(''),
    fc.constant('   '),
    fc.constant('<html></html>'),
    
    // Text only (no tags)
    fc.constant('Just plain text'),
    
    // Random strings that might break parser
    fc.string({ minLength: 0, maxLength: 100 }),
    
    // HTML with special characters
    fc.constant('<div>Special: &lt; &gt; &amp;</div>'),
    fc.constant('<div>Unicode: 你好 🎉</div>'),
    
    // Deeply nested
    fc.constant('<div><div><div><div><div>Deep</div></div></div></div></div>'),
    
    // Multiple root elements (invalid but should be handled)
    fc.constant('<div>First</div><div>Second</div>'),
    
    // HTML with attributes
    fc.constant('<button aria-label="Click me" disabled>Button</button>'),
    
    // Self-closing tags
    fc.constant('<img src="test.jpg" alt="Test" />'),
    fc.constant('<br /><hr />'),
    
    // Comments
    fc.constant('<!-- Comment --><div>Content</div>'),
    
    // CDATA (not valid in HTML but might appear)
    fc.constant('<div><![CDATA[Some data]]></div>')
  );
};

describe('Property 1: Parser Robustness', () => {
  test('parser never crashes or hangs on any input', () => {
    fc.assert(
      fc.property(arbitraryHTML(), (html) => {
        // Parser should either succeed or throw ParsingError
        // It should never crash with unexpected errors or hang
        try {
          const result = parseHTML(html);
          
          // If successful, should return a document
          expect(result.document).toBeDefined();
          expect(result.warnings).toBeDefined();
          expect(Array.isArray(result.warnings)).toBe(true);
        } catch (error) {
          // If it throws, should be ParsingError
          expect(error).toBeInstanceOf(ParsingError);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('parser returns document or clear error message', () => {
    fc.assert(
      fc.property(arbitraryHTML(), (html) => {
        try {
          const result = parseHTML(html);
          
          // Success case: should have document
          expect(result.document).toBeDefined();
          expect(result.document.nodeType).toBe(9); // DOCUMENT_NODE
        } catch (error) {
          // Error case: should have clear message
          expect(error).toBeInstanceOf(ParsingError);
          expect((error as ParsingError).message).toBeTruthy();
          expect((error as ParsingError).message.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('parser handles empty and whitespace-only input', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\n\n'),
          fc.constant('\t\t')
        ),
        (html) => {
          // Should not crash
          const result = parseHTML(html);
          expect(result.document).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('parser handles very long input without hanging', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1000, maxLength: 10000 }),
        (longString) => {
          const html = `<div>${longString}</div>`;
          
          // Should complete in reasonable time (test framework will timeout if it hangs)
          const result = parseHTML(html);
          expect(result.document).toBeDefined();
        }
      ),
      { numRuns: 10 } // Fewer runs for performance
    );
  });

  test('parser handles deeply nested structures', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (depth) => {
          // Create deeply nested HTML
          const opening = '<div>'.repeat(depth);
          const closing = '</div>'.repeat(depth);
          const html = opening + 'Content' + closing;
          
          // Should not crash or hang
          const result = parseHTML(html);
          expect(result.document).toBeDefined();
        }
      ),
      { numRuns: 20 }
    );
  });

  test('parser warnings are well-formed', () => {
    fc.assert(
      fc.property(arbitraryHTML(), (html) => {
        const result = parseHTML(html);
        
        // Each warning should have a message
        for (const warning of result.warnings) {
          expect(warning.message).toBeDefined();
          expect(typeof warning.message).toBe('string');
          expect(warning.message.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
