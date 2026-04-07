/**
 * Tests for VoiceOver renderer.
 */

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from '../../../src/extractor/tree-builder.js';
import { renderVoiceOver } from '../../../src/renderer/voiceover-renderer.js';

describe('renderVoiceOver', () => {
  describe('button announcements', () => {
    it('should announce simple button', () => {
      const dom = new JSDOM('<button>Click me</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Click me, button');
    });

    it('should announce button with expanded state', () => {
      const dom = new JSDOM('<button aria-expanded="true">Menu</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Menu, button, expanded');
    });

    it('should announce button with collapsed state', () => {
      const dom = new JSDOM('<button aria-expanded="false">Menu</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Menu, button, collapsed');
    });

    it('should announce button with pressed state', () => {
      const dom = new JSDOM('<button aria-pressed="true">Toggle</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Toggle, button, pressed');
    });

    it('should announce disabled button', () => {
      const dom = new JSDOM('<button disabled>Submit</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Submit, button, dimmed');
    });
  });

  describe('link announcements', () => {
    it('should announce simple link', () => {
      const dom = new JSDOM('<a href="/home">Home</a>');
      const link = dom.window.document.querySelector('a')!;
      const result = buildAccessibilityTree(link);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Home, link');
    });

    it('should announce current page link', () => {
      const dom = new JSDOM('<a href="/about" aria-current="page">About</a>');
      const link = dom.window.document.querySelector('a')!;
      const result = buildAccessibilityTree(link);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('About, link, current page');
    });
  });

  describe('heading announcements', () => {
    it('should announce heading with level (role first)', () => {
      const dom = new JSDOM('<h2>Section Title</h2>');
      const heading = dom.window.document.querySelector('h2')!;
      const result = buildAccessibilityTree(heading);
      
      const announcement = renderVoiceOver(result.model);
      
      // VoiceOver announces role before name for headings
      expect(announcement).toContain('heading level 2, Section Title');
    });

    it('should announce h1 (role first)', () => {
      const dom = new JSDOM('<h1>Page Title</h1>');
      const heading = dom.window.document.querySelector('h1')!;
      const result = buildAccessibilityTree(heading);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('heading level 1, Page Title');
    });

    it('should announce h6 (role first)', () => {
      const dom = new JSDOM('<h6>Subsection</h6>');
      const heading = dom.window.document.querySelector('h6')!;
      const result = buildAccessibilityTree(heading);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('heading level 6, Subsection');
    });
  });

  describe('checkbox announcements', () => {
    it('should announce checked checkbox', () => {
      const dom = new JSDOM('<input type="checkbox" checked aria-label="Accept terms">');
      const checkbox = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(checkbox);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toBe('Accept terms, checkbox, checked');
    });

    it('should announce unchecked checkbox', () => {
      const dom = new JSDOM('<input type="checkbox" aria-label="Accept terms">');
      const checkbox = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(checkbox);
      
      const announcement = renderVoiceOver(result.model);
      
      // VoiceOver says "unchecked" not "not checked"
      expect(announcement).toBe('Accept terms, checkbox, unchecked');
    });

    it('should announce mixed state checkbox', () => {
      const dom = new JSDOM('<input type="checkbox" aria-checked="mixed" aria-label="Select all">');
      const checkbox = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(checkbox);
      
      const announcement = renderVoiceOver(result.model);
      
      // VoiceOver says "mixed" not "half checked"
      expect(announcement).toBe('Select all, checkbox, mixed');
    });
  });

  describe('textbox announcements', () => {
    it('should announce textbox with value', () => {
      const dom = new JSDOM('<input type="text" value="John Doe" aria-label="Name">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderVoiceOver(result.model);
      
      // VoiceOver says "edit text" not "edit"
      expect(announcement).toBe('Name, edit text, John Doe');
    });

    it('should announce required textbox', () => {
      const dom = new JSDOM('<input type="text" required aria-label="Email">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toBe('Email, edit text, required');
    });

    it('should announce invalid textbox', () => {
      const dom = new JSDOM('<input type="text" aria-invalid="true" aria-label="Email">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderVoiceOver(result.model);
      
      // VoiceOver says "invalid data" not "invalid entry"
      expect(announcement).toBe('Email, edit text, invalid data');
    });

    it('should announce readonly textbox', () => {
      const dom = new JSDOM('<input type="text" readonly value="Read only" aria-label="Status">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toBe('Status, edit text, read only, Read only');
    });
  });

  describe('landmark announcements', () => {
    it('should announce navigation landmark (role first)', () => {
      const dom = new JSDOM('<nav aria-label="Main navigation"></nav>');
      const nav = dom.window.document.querySelector('nav')!;
      const result = buildAccessibilityTree(nav);
      
      const announcement = renderVoiceOver(result.model);
      
      // VoiceOver announces role first for landmarks
      expect(announcement).toBe('navigation, Main navigation');
    });

    it('should announce main landmark (role first)', () => {
      const dom = new JSDOM('<main></main>');
      const main = dom.window.document.querySelector('main')!;
      const result = buildAccessibilityTree(main);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toBe('main');
    });

    it('should announce banner landmark (role first)', () => {
      const dom = new JSDOM('<header></header>');
      const header = dom.window.document.querySelector('header')!;
      const result = buildAccessibilityTree(header);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toBe('banner');
    });

    it('should announce contentinfo landmark (role first)', () => {
      const dom = new JSDOM('<footer></footer>');
      const footer = dom.window.document.querySelector('footer')!;
      const result = buildAccessibilityTree(footer);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toBe('content information');
    });

    it('should announce complementary landmark (role first)', () => {
      const dom = new JSDOM('<aside aria-label="Related links"></aside>');
      const aside = dom.window.document.querySelector('aside')!;
      const result = buildAccessibilityTree(aside);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toBe('complementary, Related links');
    });
  });

  describe('list announcements', () => {
    it('should announce list with items', () => {
      const dom = new JSDOM(`
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `);
      const list = dom.window.document.querySelector('ul')!;
      const result = buildAccessibilityTree(list);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('list');
      // VoiceOver says "item" not "list item"
      expect(announcement).toContain('Item 1, item');
      expect(announcement).toContain('Item 2, item');
      expect(announcement).toContain('Item 3, item');
    });
  });

  describe('nested structures', () => {
    it('should announce navigation with links', () => {
      const dom = new JSDOM(`
        <nav aria-label="Main">
          <a href="/home">Home</a>
          <a href="/about">About</a>
        </nav>
      `);
      const nav = dom.window.document.querySelector('nav')!;
      const result = buildAccessibilityTree(nav);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('navigation, Main');
      expect(announcement).toContain('Home, link');
      expect(announcement).toContain('About, link');
    });

    it('should announce article with heading and button', () => {
      const dom = new JSDOM(`
        <article>
          <h2>Article Title</h2>
          <button aria-expanded="false">Read more</button>
        </article>
      `);
      const article = dom.window.document.querySelector('article')!;
      const result = buildAccessibilityTree(article);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('article');
      expect(announcement).toContain('heading level 2, Article Title');
      expect(announcement).toContain('Read more, button, collapsed');
    });
  });

  describe('multiple states', () => {
    it('should announce button with multiple states', () => {
      const dom = new JSDOM('<button aria-expanded="true" aria-pressed="true">Toggle Menu</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Toggle Menu, button, expanded, pressed');
    });

    it('should announce textbox with multiple states', () => {
      const dom = new JSDOM('<input type="text" required aria-invalid="true" aria-label="Email">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Email');
      expect(announcement).toContain('edit text');
      expect(announcement).toContain('invalid data');
      expect(announcement).toContain('required');
    });
  });

  describe('description handling', () => {
    it('should include description when present', () => {
      const dom = new JSDOM(`
        <div>
          <button aria-describedby="help">Submit</button>
          <div id="help">Click to submit the form</div>
        </div>
      `);
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Submit');
      expect(announcement).toContain('button');
      expect(announcement).toContain('Click to submit the form');
    });
  });

  describe('radio button announcements', () => {
    it('should announce radio button', () => {
      const dom = new JSDOM('<input type="radio" checked aria-label="Option A">');
      const radio = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(radio);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toBe('Option A, radio button, checked');
    });
  });

  describe('image announcements', () => {
    it('should announce image with alt text', () => {
      const dom = new JSDOM('<img src="logo.png" alt="Company Logo">');
      const img = dom.window.document.querySelector('img')!;
      const result = buildAccessibilityTree(img);
      
      const announcement = renderVoiceOver(result.model);
      
      // VoiceOver says "image" not "graphic"
      expect(announcement).toBe('Company Logo, image');
    });
  });

  describe('generic containers', () => {
    it('should not announce generic containers', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      
      const announcement = renderVoiceOver(result.model);
      
      // Generic container should not be announced
      expect(announcement).not.toContain('generic');
      // But children should be announced
      expect(announcement).toContain('Button 1, button');
      expect(announcement).toContain('Button 2, button');
    });
  });

  describe('VoiceOver-specific differences from NVDA', () => {
    it('should say "unchecked" not "not checked"', () => {
      const dom = new JSDOM('<input type="checkbox" aria-label="Test">');
      const checkbox = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(checkbox);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('unchecked');
      expect(announcement).not.toContain('not checked');
    });

    it('should say "dimmed" not "unavailable"', () => {
      const dom = new JSDOM('<button disabled>Test</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('dimmed');
      expect(announcement).not.toContain('unavailable');
    });

    it('should say "edit text" not "edit"', () => {
      const dom = new JSDOM('<input type="text" aria-label="Test">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('edit text');
      expect(announcement).not.toContain(', edit,');
    });

    it('should say "image" not "graphic"', () => {
      const dom = new JSDOM('<img src="test.png" alt="Test">');
      const img = dom.window.document.querySelector('img')!;
      const result = buildAccessibilityTree(img);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('image');
      expect(announcement).not.toContain('graphic');
    });

    it('should say "item" not "list item"', () => {
      const dom = new JSDOM('<ul><li>Test</li></ul>');
      const list = dom.window.document.querySelector('ul')!;
      const result = buildAccessibilityTree(list);
      
      const announcement = renderVoiceOver(result.model);
      
      expect(announcement).toContain('Test, item');
      expect(announcement).not.toContain('list item');
    });

    it('should announce heading role before name', () => {
      const dom = new JSDOM('<h2>Test</h2>');
      const heading = dom.window.document.querySelector('h2')!;
      const result = buildAccessibilityTree(heading);
      
      const announcement = renderVoiceOver(result.model);
      
      // Role first for headings
      expect(announcement).toContain('heading level 2, Test');
    });

    it('should announce landmark role before name', () => {
      const dom = new JSDOM('<nav aria-label="Test"></nav>');
      const nav = dom.window.document.querySelector('nav')!;
      const result = buildAccessibilityTree(nav);
      
      const announcement = renderVoiceOver(result.model);
      
      // Role first for landmarks
      expect(announcement).toContain('navigation, Test');
    });
  });
});
