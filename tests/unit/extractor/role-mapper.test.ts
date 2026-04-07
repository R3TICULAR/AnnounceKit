/**
 * Unit tests for role computation and mapping.
 */

import { describe, test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { computeRole, isAccessible } from '../../../src/extractor/role-mapper.js';

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

describe('computeRole', () => {
  describe('implicit roles for native elements', () => {
    test('button has button role', () => {
      const element = createElement('<button>Click</button>');
      const result = computeRole(element);
      expect(result.role).toBe('button');
    });

    test('link with href has link role', () => {
      const element = createElement('<a href="#">Link</a>');
      const result = computeRole(element);
      expect(result.role).toBe('link');
    });

    test('link without href has no role', () => {
      const element = createElement('<a>Not a link</a>');
      const result = computeRole(element);
      expect(result.role).toBeNull();
    });

    test('h1 has heading role', () => {
      const element = createElement('<h1>Heading</h1>');
      const result = computeRole(element);
      expect(result.role).toBe('heading');
    });

    test('h2 through h6 have heading role', () => {
      for (let level = 2; level <= 6; level++) {
        const element = createElement(`<h${level}>Heading</h${level}>`);
        const result = computeRole(element);
        expect(result.role).toBe('heading');
      }
    });

    test('nav has navigation role', () => {
      const element = createElement('<nav>Navigation</nav>');
      const result = computeRole(element);
      expect(result.role).toBe('navigation');
    });

    test('main has main role', () => {
      const element = createElement('<main>Main content</main>');
      const result = computeRole(element);
      expect(result.role).toBe('main');
    });

    test('aside has complementary role', () => {
      const element = createElement('<aside>Sidebar</aside>');
      const result = computeRole(element);
      expect(result.role).toBe('complementary');
    });

    test('form has form role', () => {
      const element = createElement('<form>Form</form>');
      const result = computeRole(element);
      expect(result.role).toBe('form');
    });

    test('ul has list role', () => {
      const element = createElement('<ul><li>Item</li></ul>');
      const result = computeRole(element);
      expect(result.role).toBe('list');
    });

    test('ol has list role', () => {
      const element = createElement('<ol><li>Item</li></ol>');
      const result = computeRole(element);
      expect(result.role).toBe('list');
    });

    test('li has listitem role', () => {
      const element = createElement('<li>Item</li>');
      const result = computeRole(element);
      expect(result.role).toBe('listitem');
    });

    test('img has img role', () => {
      const element = createElement('<img src="test.jpg" alt="Test" />');
      const result = computeRole(element);
      expect(result.role).toBe('img');
    });

    test('article has article role', () => {
      const element = createElement('<article>Article</article>');
      const result = computeRole(element);
      expect(result.role).toBe('article');
    });
  });

  describe('input element roles by type', () => {
    test('input type=text has textbox role', () => {
      const element = createElement('<input type="text" />');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });

    test('input type=email has textbox role', () => {
      const element = createElement('<input type="email" />');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });

    test('input type=password has textbox role', () => {
      const element = createElement('<input type="password" />');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });

    test('input type=search has textbox role', () => {
      const element = createElement('<input type="search" />');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });

    test('input type=tel has textbox role', () => {
      const element = createElement('<input type="tel" />');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });

    test('input type=url has textbox role', () => {
      const element = createElement('<input type="url" />');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });

    test('input type=number has textbox role', () => {
      const element = createElement('<input type="number" />');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });

    test('input type=button has button role', () => {
      const element = createElement('<input type="button" value="Click" />');
      const result = computeRole(element);
      expect(result.role).toBe('button');
    });

    test('input type=submit has button role', () => {
      const element = createElement('<input type="submit" />');
      const result = computeRole(element);
      expect(result.role).toBe('button');
    });

    test('input type=reset has button role', () => {
      const element = createElement('<input type="reset" />');
      const result = computeRole(element);
      expect(result.role).toBe('button');
    });

    test('input type=checkbox has checkbox role', () => {
      const element = createElement('<input type="checkbox" />');
      const result = computeRole(element);
      expect(result.role).toBe('checkbox');
    });

    test('input type=radio has radio role', () => {
      const element = createElement('<input type="radio" />');
      const result = computeRole(element);
      expect(result.role).toBe('radio');
    });

    test('input without type defaults to textbox', () => {
      const element = createElement('<input />');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });
  });

  describe('form control roles', () => {
    test('textarea has textbox role', () => {
      const element = createElement('<textarea></textarea>');
      const result = computeRole(element);
      expect(result.role).toBe('textbox');
    });

    test('select has listbox role', () => {
      const element = createElement('<select><option>Option</option></select>');
      const result = computeRole(element);
      expect(result.role).toBe('listbox');
    });
  });

  describe('explicit role attribute', () => {
    test('explicit role overrides implicit role', () => {
      const element = createElement('<div role="button">Click</div>');
      const result = computeRole(element);
      expect(result.role).toBe('button');
    });

    test('explicit role is case-insensitive', () => {
      const element = createElement('<div role="BUTTON">Click</div>');
      const result = computeRole(element);
      expect(result.role).toBe('button');
    });

    test('explicit role with whitespace is trimmed', () => {
      const element = createElement('<div role="  button  ">Click</div>');
      const result = computeRole(element);
      expect(result.role).toBe('button');
    });

    test('all 23 supported roles are accepted', () => {
      const roles = [
        'button', 'link', 'heading', 'textbox', 'checkbox', 'radio',
        'combobox', 'listbox', 'option', 'list', 'listitem',
        'navigation', 'main', 'banner', 'contentinfo', 'region',
        'img', 'article', 'complementary', 'form', 'search', 'generic'
      ];

      for (const role of roles) {
        const element = createElement(`<div role="${role}">Content</div>`);
        const result = computeRole(element);
        expect(result.role).toBe(role);
      }
    });
  });

  describe('invalid roles', () => {
    test('invalid role emits warning and falls back to implicit', () => {
      const element = createElement('<button role="invalid-role">Click</button>');
      const result = computeRole(element);
      
      expect(result.role).toBe('button'); // Falls back to implicit
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('invalid-role');
    });

    test('unsupported role emits warning', () => {
      const element = createElement('<div role="tooltip">Tooltip</div>');
      const result = computeRole(element);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('tooltip');
    });

    test('role=presentation returns null', () => {
      const element = createElement('<div role="presentation">Hidden</div>');
      const result = computeRole(element);
      expect(result.role).toBeNull();
    });

    test('role=none returns null', () => {
      const element = createElement('<div role="none">Hidden</div>');
      const result = computeRole(element);
      expect(result.role).toBeNull();
    });
  });

  describe('elements with no role', () => {
    test('div has no implicit role', () => {
      const element = createElement('<div>Content</div>');
      const result = computeRole(element);
      expect(result.role).toBeNull();
    });

    test('span has no implicit role', () => {
      const element = createElement('<span>Content</span>');
      const result = computeRole(element);
      expect(result.role).toBeNull();
    });

    test('p has paragraph role', () => {
      const element = createElement('<p>Paragraph</p>');
      const result = computeRole(element);
      expect(result.role).toBe('paragraph');
    });
  });

  describe('landmark context rules', () => {
    test('top-level header has banner role', () => {
      const element = createElement('<header>Header</header>');
      const result = computeRole(element);
      expect(result.role).toBe('banner');
    });

    test('top-level footer has contentinfo role', () => {
      const element = createElement('<footer>Footer</footer>');
      const result = computeRole(element);
      expect(result.role).toBe('contentinfo');
    });

    test('section with aria-label has region role', () => {
      const element = createElement('<section aria-label="Section">Content</section>');
      const result = computeRole(element);
      expect(result.role).toBe('region');
    });

    test('section with aria-labelledby has region role', () => {
      const element = createElement('<section aria-labelledby="heading">Content</section>');
      const result = computeRole(element);
      expect(result.role).toBe('region');
    });

    test('section without accessible name has no role', () => {
      const element = createElement('<section>Content</section>');
      const result = computeRole(element);
      expect(result.role).toBeNull();
    });
  });
});

describe('isAccessible', () => {
  test('element with role is accessible', () => {
    const element = createElement('<button>Click</button>');
    expect(isAccessible(element)).toBe(true);
  });

  test('element with aria-hidden=true is not accessible', () => {
    const element = createElement('<button aria-hidden="true">Click</button>');
    expect(isAccessible(element)).toBe(false);
  });

  test('element with role=presentation is not accessible', () => {
    const element = createElement('<div role="presentation">Hidden</div>');
    expect(isAccessible(element)).toBe(false);
  });

  test('element with role=none is not accessible', () => {
    const element = createElement('<div role="none">Hidden</div>');
    expect(isAccessible(element)).toBe(false);
  });

  test('element with no role is not accessible', () => {
    const element = createElement('<div>Content</div>');
    expect(isAccessible(element)).toBe(false);
  });

  test('element with explicit role is accessible', () => {
    const element = createElement('<div role="button">Click</div>');
    expect(isAccessible(element)).toBe(true);
  });
});
