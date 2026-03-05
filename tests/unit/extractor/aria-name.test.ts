/**
 * Unit tests for ARIA name computation.
 */

import { describe, test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { computeAccessibleName, computeAccessibleDescription } from '../../../src/extractor/aria-name.js';

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

/**
 * Helper to create a document with HTML.
 */
function createDocument(html: string): Document {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
  return dom.window.document;
}

describe('computeAccessibleName', () => {
  describe('aria-label', () => {
    test('uses aria-label as name', () => {
      const element = createElement('<button aria-label="Click me">Button text</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Click me');
      expect(result.warnings).toHaveLength(0);
    });

    test('trims whitespace from aria-label', () => {
      const element = createElement('<button aria-label="  Spaced  ">Button</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Spaced');
    });

    test('ignores empty aria-label', () => {
      const element = createElement('<button aria-label="">Button text</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Button text');
    });

    test('aria-label takes precedence over text content', () => {
      const element = createElement('<button aria-label="Label">Text</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Label');
    });
  });

  describe('aria-labelledby', () => {
    test('uses aria-labelledby with single ID', () => {
      const doc = createDocument(`
        <div id="label">Click me</div>
        <button aria-labelledby="label">Button</button>
      `);
      const button = doc.querySelector('button')!;
      const result = computeAccessibleName(button);
      
      expect(result.name).toBe('Click me');
    });

    test('uses aria-labelledby with multiple IDs', () => {
      const doc = createDocument(`
        <div id="label1">First</div>
        <div id="label2">Second</div>
        <button aria-labelledby="label1 label2">Button</button>
      `);
      const button = doc.querySelector('button')!;
      const result = computeAccessibleName(button);
      
      expect(result.name).toBe('First Second');
    });

    test('aria-labelledby takes precedence over aria-label', () => {
      const doc = createDocument(`
        <div id="label">Referenced</div>
        <button aria-labelledby="label" aria-label="Direct">Button</button>
      `);
      const button = doc.querySelector('button')!;
      const result = computeAccessibleName(button);
      
      expect(result.name).toBe('Referenced');
    });

    test('warns on missing ID reference', () => {
      const element = createElement('<button aria-labelledby="nonexistent">Button</button>');
      const result = computeAccessibleName(element);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('nonexistent');
    });

    test('handles circular references', () => {
      const doc = createDocument(`
        <div id="elem1" aria-labelledby="elem2">First</div>
        <div id="elem2" aria-labelledby="elem1">Second</div>
      `);
      const elem1 = doc.getElementById('elem1')!;
      const result = computeAccessibleName(elem1);
      
      expect(result.warnings.some(w => w.message.includes('Circular'))).toBe(true);
    });

    test('handles whitespace in ID list', () => {
      const doc = createDocument(`
        <div id="label1">First</div>
        <div id="label2">Second</div>
        <button aria-labelledby="  label1   label2  ">Button</button>
      `);
      const button = doc.querySelector('button')!;
      const result = computeAccessibleName(button);
      
      expect(result.name).toBe('First Second');
    });
  });

  describe('text content', () => {
    test('uses text content for button', () => {
      const element = createElement('<button>Click me</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Click me');
    });

    test('uses text content for link', () => {
      const element = createElement('<a href="#">Link text</a>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Link text');
    });

    test('uses text content for heading', () => {
      const element = createElement('<h1>Heading text</h1>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Heading text');
    });

    test('concatenates nested text content', () => {
      const element = createElement('<button>Click <span>me</span> now</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Click me now');
    });

    test('trims whitespace from text content', () => {
      const element = createElement('<button>  Spaced  </button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Spaced');
    });

    test('skips aria-hidden children', () => {
      const element = createElement('<button>Visible <span aria-hidden="true">Hidden</span></button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Visible');
    });
  });

  describe('alt attribute', () => {
    test('uses alt attribute for images', () => {
      const element = createElement('<img src="test.jpg" alt="Test image" />');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Test image');
    });

    test('uses empty alt for decorative images', () => {
      const element = createElement('<img src="test.jpg" alt="" />');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('');
    });

    test('alt takes precedence over title for images', () => {
      const element = createElement('<img src="test.jpg" alt="Alt text" title="Title text" />');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Alt text');
    });
  });

  describe('label element', () => {
    test('uses explicit label with for attribute', () => {
      const doc = createDocument(`
        <label for="input1">Email address</label>
        <input id="input1" type="text" />
      `);
      const input = doc.getElementById('input1')!;
      const result = computeAccessibleName(input);
      
      expect(result.name).toBe('Email address');
    });

    test('uses implicit label (input inside label)', () => {
      const doc = createDocument(`
        <label>
          Email address
          <input type="text" />
        </label>
      `);
      const input = doc.querySelector('input')!;
      const result = computeAccessibleName(input);
      
      expect(result.name).toBe('Email address');
    });

    test('label works for textarea', () => {
      const doc = createDocument(`
        <label for="textarea1">Comments</label>
        <textarea id="textarea1"></textarea>
      `);
      const textarea = doc.getElementById('textarea1')!;
      const result = computeAccessibleName(textarea);
      
      expect(result.name).toBe('Comments');
    });

    test('label works for select', () => {
      const doc = createDocument(`
        <label for="select1">Choose option</label>
        <select id="select1">
          <option>Option 1</option>
        </select>
      `);
      const select = doc.getElementById('select1')!;
      const result = computeAccessibleName(select);
      
      expect(result.name).toBe('Choose option');
    });
  });

  describe('title attribute', () => {
    test('uses title as fallback', () => {
      const element = createElement('<div title="Tooltip text"></div>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Tooltip text');
    });

    test('title is lower priority than aria-label', () => {
      const element = createElement('<div aria-label="Label" title="Title"></div>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Label');
    });

    test('title is lower priority than text content', () => {
      const element = createElement('<button title="Title">Button text</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Button text');
    });
  });

  describe('priority order', () => {
    test('aria-labelledby > aria-label', () => {
      const doc = createDocument(`
        <div id="label">Referenced</div>
        <button aria-labelledby="label" aria-label="Direct">Button</button>
      `);
      const button = doc.querySelector('button')!;
      const result = computeAccessibleName(button);
      
      expect(result.name).toBe('Referenced');
    });

    test('aria-label > text content', () => {
      const element = createElement('<button aria-label="Label">Text</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Label');
    });

    test('text content > title', () => {
      const element = createElement('<button title="Title">Text</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Text');
    });

    test('label > text content for inputs', () => {
      const doc = createDocument(`
        <label for="input1">Label</label>
        <input id="input1" type="button" value="Value" />
      `);
      const input = doc.getElementById('input1')!;
      const result = computeAccessibleName(input);
      
      expect(result.name).toBe('Label');
    });
  });

  describe('edge cases', () => {
    test('returns empty string for element with no name', () => {
      const element = createElement('<div></div>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('');
    });

    test('handles element with only whitespace', () => {
      const element = createElement('<button>   </button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('');
    });

    test('handles deeply nested text content', () => {
      const element = createElement('<button><span><span><span>Deep</span></span></span></button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Deep');
    });

    test('handles mixed text and element nodes', () => {
      const element = createElement('<button>Start <em>middle</em> end</button>');
      const result = computeAccessibleName(element);
      
      expect(result.name).toBe('Start middle end');
    });
  });
});


describe('computeAccessibleDescription', () => {
  test('uses aria-describedby with single ID', () => {
    const doc = createDocument(`
      <div id="desc">This is a description</div>
      <button aria-describedby="desc">Button</button>
    `);
    const button = doc.querySelector('button')!;
    const result = computeAccessibleDescription(button);
    
    expect(result.description).toBe('This is a description');
    expect(result.warnings).toHaveLength(0);
  });

  test('uses aria-describedby with multiple IDs', () => {
    const doc = createDocument(`
      <div id="desc1">First part.</div>
      <div id="desc2">Second part.</div>
      <button aria-describedby="desc1 desc2">Button</button>
    `);
    const button = doc.querySelector('button')!;
    const result = computeAccessibleDescription(button);
    
    expect(result.description).toBe('First part. Second part.');
  });

  test('uses title attribute as fallback', () => {
    const element = createElement('<button title="Tooltip text">Button</button>');
    const result = computeAccessibleDescription(element);
    
    expect(result.description).toBe('Tooltip text');
  });

  test('aria-describedby takes precedence over title', () => {
    const doc = createDocument(`
      <div id="desc">Description text</div>
      <button aria-describedby="desc" title="Title text">Button</button>
    `);
    const button = doc.querySelector('button')!;
    const result = computeAccessibleDescription(button);
    
    expect(result.description).toBe('Description text');
  });

  test('warns on missing ID reference', () => {
    const element = createElement('<button aria-describedby="nonexistent">Button</button>');
    const result = computeAccessibleDescription(element);
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].message).toContain('nonexistent');
  });

  test('returns empty string when no description', () => {
    const element = createElement('<button>Button</button>');
    const result = computeAccessibleDescription(element);
    
    expect(result.description).toBe('');
  });

  test('trims whitespace from title', () => {
    const element = createElement('<button title="  Spaced  ">Button</button>');
    const result = computeAccessibleDescription(element);
    
    expect(result.description).toBe('Spaced');
  });

  test('handles whitespace in ID list', () => {
    const doc = createDocument(`
      <div id="desc1">First</div>
      <div id="desc2">Second</div>
      <button aria-describedby="  desc1   desc2  ">Button</button>
    `);
    const button = doc.querySelector('button')!;
    const result = computeAccessibleDescription(button);
    
    expect(result.description).toBe('First Second');
  });
});
