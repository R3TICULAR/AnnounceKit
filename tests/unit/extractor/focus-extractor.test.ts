/**
 * Unit tests for focus information extraction.
 */

import { describe, test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { extractFocusInfo } from '../../../src/extractor/focus-extractor.js';

/**
 * Helper to create a DOM element from HTML string.
 */
function createElement(html: string): Element {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
  const element = dom.window.document.body.firstElementChild;
  if (!element) {
    throw new Error('Failed to create element');
  }
  return element;
}

describe('extractFocusInfo', () => {
  describe('natively focusable elements', () => {
    test('button is focusable', () => {
      const element = createElement('<button>Click</button>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
      expect(result.tabindex).toBeUndefined();
    });

    test('link with href is focusable', () => {
      const element = createElement('<a href="#">Link</a>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
    });

    test('link without href is not focusable', () => {
      const element = createElement('<a>Not a link</a>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('input is focusable', () => {
      const element = createElement('<input type="text" />');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
    });

    test('textarea is focusable', () => {
      const element = createElement('<textarea></textarea>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
    });

    test('select is focusable', () => {
      const element = createElement('<select><option>Option</option></select>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
    });

    test('area with href is focusable', () => {
      const element = createElement('<area href="#" alt="Area" />');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
    });
  });

  describe('tabindex attribute', () => {
    test('tabindex=0 makes element focusable', () => {
      const element = createElement('<div tabindex="0">Focusable</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
      expect(result.tabindex).toBe(0);
    });

    test('tabindex=-1 makes element programmatically focusable', () => {
      const element = createElement('<div tabindex="-1">Focusable</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
      expect(result.tabindex).toBe(-1);
    });

    test('tabindex > 0 makes element focusable', () => {
      const element = createElement('<div tabindex="5">Focusable</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
      expect(result.tabindex).toBe(5);
    });

    test('tabindex on natively focusable element is included', () => {
      const element = createElement('<button tabindex="2">Button</button>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
      expect(result.tabindex).toBe(2);
    });

    test('invalid tabindex is ignored', () => {
      const element = createElement('<div tabindex="invalid">Not focusable</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
      expect(result.tabindex).toBeUndefined();
    });
  });

  describe('disabled elements', () => {
    test('disabled button is not focusable', () => {
      const element = createElement('<button disabled>Disabled</button>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('disabled input is not focusable', () => {
      const element = createElement('<input disabled />');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('disabled select is not focusable', () => {
      const element = createElement('<select disabled><option>Option</option></select>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('disabled textarea is not focusable', () => {
      const element = createElement('<textarea disabled></textarea>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('aria-disabled=true makes element not focusable', () => {
      const element = createElement('<button aria-disabled="true">Disabled</button>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('aria-disabled=false does not affect focusability', () => {
      const element = createElement('<button aria-disabled="false">Enabled</button>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
    });

    test('tabindex does not override disabled state', () => {
      const element = createElement('<button disabled tabindex="0">Disabled</button>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });
  });

  describe('non-focusable elements', () => {
    test('div without tabindex is not focusable', () => {
      const element = createElement('<div>Content</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
      expect(result.tabindex).toBeUndefined();
    });

    test('span without tabindex is not focusable', () => {
      const element = createElement('<span>Content</span>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('p without tabindex is not focusable', () => {
      const element = createElement('<p>Paragraph</p>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('heading without tabindex is not focusable', () => {
      const element = createElement('<h1>Heading</h1>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });
  });

  describe('elements with ARIA roles', () => {
    test('div with role=button but no tabindex is not focusable', () => {
      const element = createElement('<div role="button">Click</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
    });

    test('div with role=button and tabindex=0 is focusable', () => {
      const element = createElement('<div role="button" tabindex="0">Click</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
      expect(result.tabindex).toBe(0);
    });
  });

  describe('edge cases', () => {
    test('element with tabindex="" is not focusable', () => {
      const element = createElement('<div tabindex="">Content</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(false);
      expect(result.tabindex).toBeUndefined();
    });

    test('element with tabindex with whitespace', () => {
      const element = createElement('<div tabindex=" 0 ">Content</div>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
      expect(result.tabindex).toBe(0);
    });

    test('button with tabindex=0 explicitly set', () => {
      const element = createElement('<button tabindex="0">Button</button>');
      const result = extractFocusInfo(element);
      expect(result.focusable).toBe(true);
      expect(result.tabindex).toBe(0);
    });
  });
});
