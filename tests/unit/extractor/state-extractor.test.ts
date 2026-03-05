/**
 * Unit tests for state and property extraction.
 */

import { describe, test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { extractState, extractValue } from '../../../src/extractor/state-extractor.js';

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

describe('extractState', () => {
  describe('aria-expanded', () => {
    test('extracts aria-expanded=true', () => {
      const element = createElement('<button aria-expanded="true">Menu</button>');
      const result = extractState(element);
      expect(result.state.expanded).toBe(true);
    });

    test('extracts aria-expanded=false', () => {
      const element = createElement('<button aria-expanded="false">Menu</button>');
      const result = extractState(element);
      expect(result.state.expanded).toBe(false);
    });

    test('omits aria-expanded when not present', () => {
      const element = createElement('<button>Menu</button>');
      const result = extractState(element);
      expect(result.state.expanded).toBeUndefined();
    });

    test('warns on invalid aria-expanded value', () => {
      const element = createElement('<button aria-expanded="maybe">Menu</button>');
      const result = extractState(element);
      expect(result.state.expanded).toBeUndefined();
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('aria-checked', () => {
    test('extracts aria-checked=true', () => {
      const element = createElement('<div role="checkbox" aria-checked="true">Checkbox</div>');
      const result = extractState(element);
      expect(result.state.checked).toBe(true);
    });

    test('extracts aria-checked=false', () => {
      const element = createElement('<div role="checkbox" aria-checked="false">Checkbox</div>');
      const result = extractState(element);
      expect(result.state.checked).toBe(false);
    });

    test('extracts aria-checked=mixed', () => {
      const element = createElement('<div role="checkbox" aria-checked="mixed">Checkbox</div>');
      const result = extractState(element);
      expect(result.state.checked).toBe('mixed');
    });

    test('warns on invalid aria-checked value', () => {
      const element = createElement('<div role="checkbox" aria-checked="invalid">Checkbox</div>');
      const result = extractState(element);
      expect(result.state.checked).toBeUndefined();
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('aria-pressed', () => {
    test('extracts aria-pressed=true', () => {
      const element = createElement('<button aria-pressed="true">Toggle</button>');
      const result = extractState(element);
      expect(result.state.pressed).toBe(true);
    });

    test('extracts aria-pressed=false', () => {
      const element = createElement('<button aria-pressed="false">Toggle</button>');
      const result = extractState(element);
      expect(result.state.pressed).toBe(false);
    });

    test('extracts aria-pressed=mixed', () => {
      const element = createElement('<button aria-pressed="mixed">Toggle</button>');
      const result = extractState(element);
      expect(result.state.pressed).toBe('mixed');
    });
  });

  describe('aria-selected', () => {
    test('extracts aria-selected=true', () => {
      const element = createElement('<div role="option" aria-selected="true">Option</div>');
      const result = extractState(element);
      expect(result.state.selected).toBe(true);
    });

    test('extracts aria-selected=false', () => {
      const element = createElement('<div role="option" aria-selected="false">Option</div>');
      const result = extractState(element);
      expect(result.state.selected).toBe(false);
    });
  });

  describe('aria-disabled', () => {
    test('extracts aria-disabled=true', () => {
      const element = createElement('<button aria-disabled="true">Disabled</button>');
      const result = extractState(element);
      expect(result.state.disabled).toBe(true);
    });

    test('extracts aria-disabled=false', () => {
      const element = createElement('<button aria-disabled="false">Enabled</button>');
      const result = extractState(element);
      expect(result.state.disabled).toBe(false);
    });
  });

  describe('aria-invalid', () => {
    test('extracts aria-invalid=true', () => {
      const element = createElement('<input aria-invalid="true" />');
      const result = extractState(element);
      expect(result.state.invalid).toBe(true);
    });

    test('extracts aria-invalid=false', () => {
      const element = createElement('<input aria-invalid="false" />');
      const result = extractState(element);
      expect(result.state.invalid).toBe(false);
    });
  });

  describe('aria-required', () => {
    test('extracts aria-required=true', () => {
      const element = createElement('<input aria-required="true" />');
      const result = extractState(element);
      expect(result.state.required).toBe(true);
    });

    test('extracts aria-required=false', () => {
      const element = createElement('<input aria-required="false" />');
      const result = extractState(element);
      expect(result.state.required).toBe(false);
    });
  });

  describe('aria-readonly', () => {
    test('extracts aria-readonly=true', () => {
      const element = createElement('<input aria-readonly="true" />');
      const result = extractState(element);
      expect(result.state.readonly).toBe(true);
    });

    test('extracts aria-readonly=false', () => {
      const element = createElement('<input aria-readonly="false" />');
      const result = extractState(element);
      expect(result.state.readonly).toBe(false);
    });
  });

  describe('aria-busy', () => {
    test('extracts aria-busy=true', () => {
      const element = createElement('<div aria-busy="true">Loading...</div>');
      const result = extractState(element);
      expect(result.state.busy).toBe(true);
    });
  });

  describe('aria-current', () => {
    test('extracts aria-current=page', () => {
      const element = createElement('<a href="#" aria-current="page">Current</a>');
      const result = extractState(element);
      expect(result.state.current).toBe('page');
    });

    test('extracts aria-current=step', () => {
      const element = createElement('<div aria-current="step">Step 2</div>');
      const result = extractState(element);
      expect(result.state.current).toBe('step');
    });

    test('extracts aria-current=location', () => {
      const element = createElement('<a href="#" aria-current="location">Here</a>');
      const result = extractState(element);
      expect(result.state.current).toBe('location');
    });

    test('extracts aria-current=false', () => {
      const element = createElement('<a href="#" aria-current="false">Not current</a>');
      const result = extractState(element);
      expect(result.state.current).toBe(false);
    });

    test('warns on invalid aria-current value', () => {
      const element = createElement('<a href="#" aria-current="invalid">Link</a>');
      const result = extractState(element);
      expect(result.state.current).toBeUndefined();
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('aria-grabbed', () => {
    test('extracts aria-grabbed=true', () => {
      const element = createElement('<div aria-grabbed="true">Item</div>');
      const result = extractState(element);
      expect(result.state.grabbed).toBe(true);
    });
  });

  describe('aria-hidden', () => {
    test('extracts aria-hidden=true', () => {
      const element = createElement('<div aria-hidden="true">Hidden</div>');
      const result = extractState(element);
      expect(result.state.hidden).toBe(true);
    });
  });

  describe('aria-level', () => {
    test('extracts aria-level from attribute', () => {
      const element = createElement('<div role="heading" aria-level="2">Heading</div>');
      const result = extractState(element);
      expect(result.state.level).toBe(2);
    });

    test('extracts level from h1-h6 tags', () => {
      for (let level = 1; level <= 6; level++) {
        const element = createElement(`<h${level}>Heading</h${level}>`);
        const result = extractState(element);
        expect(result.state.level).toBe(level);
      }
    });

    test('aria-level overrides native heading level', () => {
      const element = createElement('<h1 aria-level="3">Heading</h1>');
      const result = extractState(element);
      expect(result.state.level).toBe(3);
    });

    test('warns on invalid aria-level value', () => {
      const element = createElement('<div role="heading" aria-level="10">Heading</div>');
      const result = extractState(element);
      expect(result.state.level).toBeUndefined();
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('aria-posinset and aria-setsize', () => {
    test('extracts aria-posinset', () => {
      const element = createElement('<div role="option" aria-posinset="2">Option</div>');
      const result = extractState(element);
      expect(result.state.posinset).toBe(2);
    });

    test('extracts aria-setsize', () => {
      const element = createElement('<div role="option" aria-setsize="10">Option</div>');
      const result = extractState(element);
      expect(result.state.setsize).toBe(10);
    });

    test('extracts both posinset and setsize', () => {
      const element = createElement('<div role="option" aria-posinset="3" aria-setsize="10">Option</div>');
      const result = extractState(element);
      expect(result.state.posinset).toBe(3);
      expect(result.state.setsize).toBe(10);
    });

    test('warns on invalid posinset', () => {
      const element = createElement('<div role="option" aria-posinset="invalid">Option</div>');
      const result = extractState(element);
      expect(result.state.posinset).toBeUndefined();
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('native element states', () => {
    test('extracts native checked state from checkbox', () => {
      const element = createElement('<input type="checkbox" checked />');
      const result = extractState(element);
      expect(result.state.checked).toBe(true);
    });

    test('extracts native checked state from radio', () => {
      const element = createElement('<input type="radio" checked />');
      const result = extractState(element);
      expect(result.state.checked).toBe(true);
    });

    test('extracts native disabled state', () => {
      const element = createElement('<button disabled>Disabled</button>');
      const result = extractState(element);
      expect(result.state.disabled).toBe(true);
    });

    test('extracts native required state', () => {
      const element = createElement('<input required />');
      const result = extractState(element);
      expect(result.state.required).toBe(true);
    });

    test('extracts native readonly state', () => {
      const element = createElement('<input readonly />');
      const result = extractState(element);
      expect(result.state.readonly).toBe(true);
    });

    test('aria-checked overrides native checked', () => {
      const element = createElement('<input type="checkbox" checked aria-checked="false" />');
      const result = extractState(element);
      expect(result.state.checked).toBe(false);
    });

    test('aria-disabled overrides native disabled', () => {
      const element = createElement('<button disabled aria-disabled="false">Button</button>');
      const result = extractState(element);
      expect(result.state.disabled).toBe(false);
    });
  });
});

describe('extractValue', () => {
  describe('input elements', () => {
    test('extracts value from text input', () => {
      const element = createElement('<input type="text" value="Hello" />');
      const result = extractValue(element);
      expect(result.value).toEqual({
        current: 'Hello',
        text: 'Hello',
      });
    });

    test('extracts value from email input', () => {
      const element = createElement('<input type="email" value="test@example.com" />');
      const result = extractValue(element);
      expect(result.value).toEqual({
        current: 'test@example.com',
        text: 'test@example.com',
      });
    });

    test('returns undefined for empty input', () => {
      const element = createElement('<input type="text" value="" />');
      const result = extractValue(element);
      expect(result.value).toBeUndefined();
    });

    test('returns undefined for checkbox', () => {
      const element = createElement('<input type="checkbox" checked />');
      const result = extractValue(element);
      expect(result.value).toBeUndefined();
    });

    test('returns undefined for radio', () => {
      const element = createElement('<input type="radio" checked />');
      const result = extractValue(element);
      expect(result.value).toBeUndefined();
    });

    test('returns undefined for button input', () => {
      const element = createElement('<input type="button" value="Click" />');
      const result = extractValue(element);
      expect(result.value).toBeUndefined();
    });
  });

  describe('textarea elements', () => {
    test('extracts value from textarea', () => {
      const element = createElement('<textarea>Text content</textarea>');
      const result = extractValue(element);
      expect(result.value).toEqual({
        current: 'Text content',
        text: 'Text content',
      });
    });

    test('returns undefined for empty textarea', () => {
      const element = createElement('<textarea></textarea>');
      const result = extractValue(element);
      expect(result.value).toBeUndefined();
    });
  });

  describe('select elements', () => {
    test('extracts value from select', () => {
      const element = createElement('<select><option value="1" selected>Option 1</option></select>');
      const result = extractValue(element);
      expect(result.value).toEqual({
        current: '1',
        text: 'Option 1',
      });
    });
  });

  describe('aria-valuenow', () => {
    test('extracts aria-valuenow', () => {
      const element = createElement('<div role="slider" aria-valuenow="50">Slider</div>');
      const result = extractValue(element);
      expect(result.value).toEqual({
        current: 50,
      });
    });

    test('extracts aria-valuenow with min and max', () => {
      const element = createElement('<div role="slider" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">Slider</div>');
      const result = extractValue(element);
      expect(result.value).toEqual({
        current: 50,
        min: 0,
        max: 100,
      });
    });

    test('extracts aria-valuenow with text', () => {
      const element = createElement('<div role="slider" aria-valuenow="50" aria-valuetext="50%">Slider</div>');
      const result = extractValue(element);
      expect(result.value).toEqual({
        current: 50,
        text: '50%',
      });
    });
  });

  describe('non-form elements', () => {
    test('returns undefined for div', () => {
      const element = createElement('<div>Content</div>');
      const result = extractValue(element);
      expect(result.value).toBeUndefined();
    });

    test('returns undefined for button', () => {
      const element = createElement('<button>Click</button>');
      const result = extractValue(element);
      expect(result.value).toBeUndefined();
    });
  });
});
