/**
 * Tests for accessibility tree builder.
 */

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from '../../../src/extractor/tree-builder.js';

describe('buildAccessibilityTree', () => {
  describe('basic tree building', () => {
    it('should build tree from single button', () => {
      const dom = new JSDOM(`<button>Click me</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const result = buildAccessibilityTree(button);
      
      expect(result.model.root).toMatchObject({
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      });
    });

    it('should build tree from link with href', () => {
      const dom = new JSDOM(`<a href="/home">Home</a>`);
      const link = dom.window.document.querySelector('a')!;
      
      const result = buildAccessibilityTree(link);
      
      expect(result.model.root).toMatchObject({
        role: 'link',
        name: 'Home',
        state: {},
        focus: { focusable: true },
        children: [],
      });
    });

    it('should build tree from heading', () => {
      const dom = new JSDOM(`<h2>Section Title</h2>`);
      const heading = dom.window.document.querySelector('h2')!;
      
      const result = buildAccessibilityTree(heading);
      
      expect(result.model.root).toMatchObject({
        role: 'heading',
        name: 'Section Title',
        state: { level: 2 },
        focus: { focusable: false },
        children: [],
      });
    });

    it('should build tree from checkbox', () => {
      const dom = new JSDOM(`<input type="checkbox" checked aria-label="Accept terms">`);
      const checkbox = dom.window.document.querySelector('input')!;
      
      const result = buildAccessibilityTree(checkbox);
      
      expect(result.model.root).toMatchObject({
        role: 'checkbox',
        name: 'Accept terms',
        state: { checked: true },
        focus: { focusable: true },
        children: [],
      });
    });

    it('should extract value from text input', () => {
      const dom = new JSDOM(`<input type="text" value="John Doe" aria-label="Name">`);
      const input = dom.window.document.querySelector('input')!;
      
      const result = buildAccessibilityTree(input);
      
      expect(result.model.root).toMatchObject({
        role: 'textbox',
        name: 'Name',
        value: {
          current: 'John Doe',
          text: 'John Doe',
        },
        state: {},
        focus: { focusable: true },
        children: [],
      });
    });
  });

  describe('nested structures', () => {
    it('should build tree with nested children', () => {
      const dom = new JSDOM(`
        <nav aria-label="Main">
          <a href="/home">Home</a>
          <a href="/about">About</a>
        </nav>
      `);
      const nav = dom.window.document.querySelector('nav')!;
      
      const result = buildAccessibilityTree(nav);
      
      expect(result.model.root.role).toBe('navigation');
      expect(result.model.root.name).toBe('Main');
      expect(result.model.root.children).toHaveLength(2);
      expect(result.model.root.children[0]).toMatchObject({
        role: 'link',
        name: 'Home',
      });
      expect(result.model.root.children[1]).toMatchObject({
        role: 'link',
        name: 'About',
      });
    });

    it('should build tree with deeply nested structure', () => {
      const dom = new JSDOM(`
        <main>
          <article>
            <h1>Article Title</h1>
            <button>Action</button>
          </article>
        </main>
      `);
      const main = dom.window.document.querySelector('main')!;
      
      const result = buildAccessibilityTree(main);
      
      expect(result.model.root.role).toBe('main');
      expect(result.model.root.children).toHaveLength(1);
      
      const article = result.model.root.children[0];
      expect(article.role).toBe('article');
      expect(article.children).toHaveLength(2);
      expect(article.children[0].role).toBe('heading');
      expect(article.children[1].role).toBe('button');
    });

    it('should build tree with list structure', () => {
      const dom = new JSDOM(`
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `);
      const list = dom.window.document.querySelector('ul')!;
      
      const result = buildAccessibilityTree(list);
      
      expect(result.model.root.role).toBe('list');
      expect(result.model.root.children).toHaveLength(3);
      expect(result.model.root.children[0]).toMatchObject({
        role: 'listitem',
        name: 'Item 1',
      });
      expect(result.model.root.children[1]).toMatchObject({
        role: 'listitem',
        name: 'Item 2',
      });
      expect(result.model.root.children[2]).toMatchObject({
        role: 'listitem',
        name: 'Item 3',
      });
    });
  });

  describe('filtering inaccessible elements', () => {
    it('should filter elements with aria-hidden="true"', () => {
      const dom = new JSDOM(`
        <div>
          <button>Visible</button>
          <button aria-hidden="true">Hidden</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const result = buildAccessibilityTree(div);
      
      // Generic container with only visible button
      expect(result.model.root.children).toHaveLength(1);
      expect(result.model.root.children[0]).toMatchObject({
        role: 'button',
        name: 'Visible',
      });
    });

    it('should filter elements with role="presentation"', () => {
      const dom = new JSDOM(`
        <div>
          <button>Visible</button>
          <button role="presentation">Presentational</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const result = buildAccessibilityTree(div);
      
      // Generic container with only visible button
      expect(result.model.root.children).toHaveLength(1);
      expect(result.model.root.children[0]).toMatchObject({
        role: 'button',
        name: 'Visible',
      });
    });

    it('should filter elements with role="none"', () => {
      const dom = new JSDOM(`
        <div>
          <button>Visible</button>
          <button role="none">None</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const result = buildAccessibilityTree(div);
      
      // Generic container with only visible button
      expect(result.model.root.children).toHaveLength(1);
      expect(result.model.root.children[0]).toMatchObject({
        role: 'button',
        name: 'Visible',
      });
    });

    it('should filter elements without accessible role', () => {
      const dom = new JSDOM(`
        <div>
          <button>Accessible</button>
          <div>Not accessible</div>
          <span>Also not accessible</span>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const result = buildAccessibilityTree(div);
      
      // Generic container with only button
      expect(result.model.root.children).toHaveLength(1);
      expect(result.model.root.children[0]).toMatchObject({
        role: 'button',
        name: 'Accessible',
      });
    });

    it('should filter nested aria-hidden elements', () => {
      const dom = new JSDOM(`
        <nav aria-label="Main">
          <a href="/home">Home</a>
          <div aria-hidden="true">
            <a href="/hidden">Hidden Link</a>
          </div>
          <a href="/about">About</a>
        </nav>
      `);
      const nav = dom.window.document.querySelector('nav')!;
      
      const result = buildAccessibilityTree(nav);
      
      expect(result.model.root.children).toHaveLength(2);
      expect(result.model.root.children[0].name).toBe('Home');
      expect(result.model.root.children[1].name).toBe('About');
    });
  });

  describe('generic container fallback', () => {
    it('should create generic container when root has no role', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const result = buildAccessibilityTree(div);
      
      expect(result.model.root.role).toBe('generic');
      expect(result.model.root.name).toBe('');
      expect(result.model.root.children).toHaveLength(2);
    });

    it('should create generic container for plain div with accessible children', () => {
      const dom = new JSDOM(`
        <div>
          <h1>Title</h1>
          <nav aria-label="Main">
            <a href="/home">Home</a>
          </nav>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const result = buildAccessibilityTree(div);
      
      expect(result.model.root.role).toBe('generic');
      expect(result.model.root.children).toHaveLength(2);
      expect(result.model.root.children[0].role).toBe('heading');
      expect(result.model.root.children[1].role).toBe('navigation');
    });
  });

  describe('model metadata', () => {
    it('should include version in model', () => {
      const dom = new JSDOM(`<button>Click</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const result = buildAccessibilityTree(button);
      
      expect(result.model.version).toEqual({
        major: 1,
        minor: 0,
      });
    });

    it('should include extractedAt timestamp', () => {
      const dom = new JSDOM(`<button>Click</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const before = new Date().toISOString();
      const result = buildAccessibilityTree(button);
      const after = new Date().toISOString();
      
      expect(result.model.metadata.extractedAt).toBeDefined();
      expect(result.model.metadata.extractedAt >= before).toBe(true);
      expect(result.model.metadata.extractedAt <= after).toBe(true);
    });

    it('should include sourceHash when provided', () => {
      const dom = new JSDOM(`<button>Click</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const result = buildAccessibilityTree(button, 'abc123');
      
      expect(result.model.metadata.sourceHash).toBe('abc123');
    });

    it('should not include sourceHash when not provided', () => {
      const dom = new JSDOM(`<button>Click</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const result = buildAccessibilityTree(button);
      
      expect(result.model.metadata.sourceHash).toBeUndefined();
    });
  });

  describe('warning collection', () => {
    it('should collect warnings from role computation', () => {
      const dom = new JSDOM(`<button role="invalid-role">Click</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const result = buildAccessibilityTree(button);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Invalid or unsupported role');
    });

    it('should collect warnings from name computation', () => {
      const dom = new JSDOM(`<button aria-labelledby="nonexistent">Click</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const result = buildAccessibilityTree(button);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.message.includes('non-existent ID'))).toBe(true);
    });

    it('should collect warnings from nested elements', () => {
      const dom = new JSDOM(`
        <nav>
          <button role="invalid1">Button 1</button>
          <button role="invalid2">Button 2</button>
        </nav>
      `);
      const nav = dom.window.document.querySelector('nav')!;
      
      const result = buildAccessibilityTree(nav);
      
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('complex real-world examples', () => {
    it('should build tree for form with validation', () => {
      const dom = new JSDOM(`
        <form>
          <label for="email">Email</label>
          <input type="email" id="email" value="user@example.com" required aria-invalid="true">
          <button type="submit">Submit</button>
        </form>
      `);
      const form = dom.window.document.querySelector('form')!;
      
      const result = buildAccessibilityTree(form);
      
      expect(result.model.root.role).toBe('form');
      expect(result.model.root.children).toHaveLength(2); // input and button (label is not accessible)
      
      const input = result.model.root.children[0];
      expect(input).toMatchObject({
        role: 'textbox',
        name: 'Email',
        value: {
          current: 'user@example.com',
          text: 'user@example.com',
        },
        state: {
          required: true,
          invalid: true,
        },
      });
      
      const button = result.model.root.children[1];
      expect(button).toMatchObject({
        role: 'button',
        name: 'Submit',
      });
    });

    it('should build tree for navigation with aria-current', () => {
      const dom = new JSDOM(`
        <nav aria-label="Main navigation">
          <a href="/home">Home</a>
          <a href="/about" aria-current="page">About</a>
          <a href="/contact">Contact</a>
        </nav>
      `);
      const nav = dom.window.document.querySelector('nav')!;
      
      const result = buildAccessibilityTree(nav);
      
      expect(result.model.root).toMatchObject({
        role: 'navigation',
        name: 'Main navigation',
      });
      expect(result.model.root.children).toHaveLength(3);
      expect(result.model.root.children[1]).toMatchObject({
        role: 'link',
        name: 'About',
        state: {
          current: 'page',
        },
      });
    });

    it('should build tree for accordion with expanded state', () => {
      const dom = new JSDOM(`
        <div>
          <button aria-expanded="true" aria-controls="panel1">Section 1</button>
          <div id="panel1" role="region">
            <button>Action</button>
          </div>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const result = buildAccessibilityTree(div);
      
      expect(result.model.root.children).toHaveLength(2);
      expect(result.model.root.children[0]).toMatchObject({
        role: 'button',
        name: 'Section 1',
        state: {
          expanded: true,
        },
      });
      expect(result.model.root.children[1]).toMatchObject({
        role: 'region',
      });
    });
  });
});
