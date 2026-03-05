/**
 * Unit tests for HTML parser.
 */

import { describe, test, expect } from 'vitest';
import {
  parseHTML,
  parseHTMLStrict,
  validateHTMLNotEmpty,
  ParsingError,
} from '../../../src/parser/html-parser.js';

describe('parseHTML', () => {
  test('parses valid HTML', () => {
    const html = '<!DOCTYPE html><html><body><button>Click me</button></body></html>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.warnings).toEqual([]);
    expect(result.document.querySelector('button')).toBeTruthy();
    expect(result.document.querySelector('button')?.textContent).toBe('Click me');
  });

  test('parses minimal HTML', () => {
    const html = '<div>Hello</div>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.querySelector('div')).toBeTruthy();
    expect(result.document.querySelector('div')?.textContent).toBe('Hello');
  });

  test('parses HTML with unclosed tags', () => {
    const html = '<div><p>Unclosed paragraph';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    // jsdom should auto-close tags
    expect(result.document.querySelector('div')).toBeTruthy();
    expect(result.document.querySelector('p')).toBeTruthy();
  });

  test('parses HTML with invalid nesting', () => {
    const html = '<p><div>Invalid nesting</div></p>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    // jsdom will restructure to valid HTML
    expect(result.document.body?.textContent).toContain('Invalid nesting');
  });

  test('parses empty HTML', () => {
    const html = '';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.body).toBeTruthy();
  });

  test('parses whitespace-only HTML', () => {
    const html = '   \n\t  ';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.body).toBeTruthy();
  });

  test('parses HTML with special characters', () => {
    const html = '<div>Special: &lt; &gt; &amp;</div>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.querySelector('div')?.textContent).toBe('Special: < > &');
  });

  test('parses HTML with Unicode', () => {
    const html = '<div>Unicode: 你好 🎉</div>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.querySelector('div')?.textContent).toBe('Unicode: 你好 🎉');
  });

  test('parses deeply nested HTML', () => {
    const html = '<div><div><div><div><div>Deep</div></div></div></div></div>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.body?.textContent).toContain('Deep');
  });

  test('parses HTML with multiple root elements', () => {
    const html = '<div>First</div><div>Second</div>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.querySelectorAll('div')).toHaveLength(2);
  });

  test('parses HTML with ARIA attributes', () => {
    const html = '<button aria-label="Click me" aria-pressed="true">Button</button>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    const button = result.document.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Click me');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });

  test('parses HTML with self-closing tags', () => {
    const html = '<img src="test.jpg" alt="Test" /><br />';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.querySelector('img')).toBeTruthy();
    expect(result.document.querySelector('br')).toBeTruthy();
  });

  test('parses HTML with comments', () => {
    const html = '<!-- Comment --><div>Content</div>';
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.querySelector('div')?.textContent).toBe('Content');
  });

  test('parses large HTML document', () => {
    const largeContent = 'x'.repeat(10000);
    const html = `<div>${largeContent}</div>`;
    const result = parseHTML(html);

    expect(result.document).toBeDefined();
    expect(result.document.querySelector('div')?.textContent).toBe(largeContent);
  });

  test('returns document with correct node type', () => {
    const html = '<div>Test</div>';
    const result = parseHTML(html);

    expect(result.document.nodeType).toBe(9); // DOCUMENT_NODE
  });

  test('returns warnings array', () => {
    const html = '<div>Test</div>';
    const result = parseHTML(html);

    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

describe('parseHTMLStrict', () => {
  test('returns document for valid HTML', () => {
    const html = '<!DOCTYPE html><html><body><button>Click</button></body></html>';
    const document = parseHTMLStrict(html);

    expect(document).toBeDefined();
    expect(document.querySelector('button')).toBeTruthy();
  });

  test('returns document for HTML without warnings', () => {
    const html = '<div>Hello</div>';
    const document = parseHTMLStrict(html);

    expect(document).toBeDefined();
    expect(document.querySelector('div')?.textContent).toBe('Hello');
  });
});

describe('validateHTMLNotEmpty', () => {
  test('accepts non-empty HTML', () => {
    expect(() => validateHTMLNotEmpty('<div>Test</div>')).not.toThrow();
    expect(() => validateHTMLNotEmpty('<!DOCTYPE html><html></html>')).not.toThrow();
    expect(() => validateHTMLNotEmpty('x')).not.toThrow();
  });

  test('rejects empty string', () => {
    expect(() => validateHTMLNotEmpty('')).toThrow(ParsingError);
    expect(() => validateHTMLNotEmpty('')).toThrow(/empty/i);
  });

  test('rejects whitespace-only string', () => {
    expect(() => validateHTMLNotEmpty('   ')).toThrow(ParsingError);
    expect(() => validateHTMLNotEmpty('\n\t')).toThrow(ParsingError);
  });
});

describe('ParsingError', () => {
  test('is instance of Error', () => {
    const error = new ParsingError('Test error');
    expect(error).toBeInstanceOf(Error);
  });

  test('has correct name', () => {
    const error = new ParsingError('Test error');
    expect(error.name).toBe('ParsingError');
  });

  test('stores message', () => {
    const error = new ParsingError('Test error');
    expect(error.message).toBe('Test error');
  });

  test('stores cause when provided', () => {
    const cause = new Error('Original error');
    const error = new ParsingError('Wrapped error', cause);
    expect(error.cause).toBe(cause);
  });
});
