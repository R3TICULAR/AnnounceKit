/**
 * Unit tests for the browser parser adapter.
 * Validates: Requirements 7.1, 7.2, 7.3
 */

import { describe, it, expect } from 'vitest';
import { parseHTML, validateHTMLNotEmpty, ParsingError } from '../browser-parser.js';

describe('parseHTML', () => {
  it('should parse valid HTML and return a document with no warnings', () => {
    const result = parseHTML('<button>Click me</button>');

    expect(result.document).toBeInstanceOf(Document);
    expect(result.warnings).toHaveLength(0);
    expect(result.document.querySelector('button')).not.toBeNull();
    expect(result.document.querySelector('button')!.textContent).toBe('Click me');
  });

  it('should parse a full HTML document', () => {
    const html = `<!DOCTYPE html>
<html lang="en">
  <head><title>Test</title></head>
  <body><h1>Hello</h1></body>
</html>`;
    const result = parseHTML(html);

    expect(result.document).toBeInstanceOf(Document);
    expect(result.warnings).toHaveLength(0);
    expect(result.document.querySelector('h1')!.textContent).toBe('Hello');
  });

  it('should handle empty string without throwing', () => {
    const result = parseHTML('');

    expect(result.document).toBeInstanceOf(Document);
    expect(Array.isArray(result.warnings)).toBe(true);
    // DOMParser creates a body even for empty input
    expect(result.document.body).toBeDefined();
  });

  it('should handle malformed HTML with unclosed tags without throwing', () => {
    const result = parseHTML('<div><p>Unclosed');

    expect(result.document).toBeInstanceOf(Document);
    // DOMParser recovers from unclosed tags
    expect(result.document.querySelector('div')).not.toBeNull();
    expect(result.document.querySelector('p')).not.toBeNull();
  });

  it('should handle deeply nested malformed HTML without throwing', () => {
    const result = parseHTML('<div><span><b>text');

    expect(result.document).toBeInstanceOf(Document);
    expect(result.document.querySelector('b')!.textContent).toBe('text');
  });

  it('should handle non-HTML content without throwing', () => {
    const result = parseHTML('just plain text, no tags at all');

    expect(result.document).toBeInstanceOf(Document);
    expect(result.document.body.textContent).toContain('just plain text');
  });

  it('should handle HTML with ARIA attributes correctly', () => {
    const result = parseHTML(
      '<button aria-expanded="false" aria-label="Toggle menu">☰</button>'
    );

    const button = result.document.querySelector('button')!;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Toggle menu');
  });

  it('should return a document whose body is accessible for tree extraction', () => {
    const result = parseHTML('<nav><a href="/">Home</a></nav>');

    expect(result.document.body).toBeDefined();
    expect(result.document.body.querySelector('nav')).not.toBeNull();
    expect(result.document.body.querySelector('a')!.getAttribute('href')).toBe('/');
  });
});

describe('validateHTMLNotEmpty (re-exported)', () => {
  it('should not throw for non-empty HTML', () => {
    expect(() => validateHTMLNotEmpty('<button>OK</button>')).not.toThrow();
  });

  it('should throw ParsingError for empty string', () => {
    expect(() => validateHTMLNotEmpty('')).toThrow(ParsingError);
  });

  it('should throw ParsingError for whitespace-only string', () => {
    expect(() => validateHTMLNotEmpty('   \n\t  ')).toThrow(ParsingError);
  });
});

describe('ParsingError (re-exported)', () => {
  it('should be constructable and have correct name', () => {
    const err = new ParsingError('test error');
    expect(err.name).toBe('ParsingError');
    expect(err.message).toBe('test error');
    expect(err).toBeInstanceOf(Error);
  });
});
