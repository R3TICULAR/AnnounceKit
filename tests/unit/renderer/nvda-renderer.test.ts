/**
 * Tests for NVDA renderer.
 */

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from '../../../src/extractor/tree-builder.js';
import { renderNVDA } from '../../../src/renderer/nvda-renderer.js';

describe('renderNVDA', () => {
  describe('button announcements', () => {
    it('should announce simple button', () => {
      const dom = new JSDOM('<button>Click me</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Click me, button');
    });

    it('should announce button with expanded state', () => {
      const dom = new JSDOM('<button aria-expanded="true">Menu</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Menu, button, expanded');
    });

    it('should announce button with collapsed state', () => {
      const dom = new JSDOM('<button aria-expanded="false">Menu</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Menu, button, collapsed');
    });

    it('should announce button with pressed state', () => {
      const dom = new JSDOM('<button aria-pressed="true">Toggle</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Toggle, button, pressed');
    });

    it('should announce disabled button', () => {
      const dom = new JSDOM('<button disabled>Submit</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Submit, button, unavailable');
    });
  });

  describe('link announcements', () => {
    it('should announce simple link', () => {
      const dom = new JSDOM('<a href="/home">Home</a>');
      const link = dom.window.document.querySelector('a')!;
      const result = buildAccessibilityTree(link);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Home, link');
    });

    it('should announce current page link', () => {
      const dom = new JSDOM('<a href="/about" aria-current="page">About</a>');
      const link = dom.window.document.querySelector('a')!;
      const result = buildAccessibilityTree(link);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('About, link, current page');
    });
  });

  describe('heading announcements', () => {
    it('should announce heading with level', () => {
      const dom = new JSDOM('<h2>Section Title</h2>');
      const heading = dom.window.document.querySelector('h2')!;
      const result = buildAccessibilityTree(heading);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Section Title, heading level 2');
    });

    it('should announce h1', () => {
      const dom = new JSDOM('<h1>Page Title</h1>');
      const heading = dom.window.document.querySelector('h1')!;
      const result = buildAccessibilityTree(heading);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Page Title, heading level 1');
    });

    it('should announce h6', () => {
      const dom = new JSDOM('<h6>Subsection</h6>');
      const heading = dom.window.document.querySelector('h6')!;
      const result = buildAccessibilityTree(heading);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Subsection, heading level 6');
    });
  });

  describe('checkbox announcements', () => {
    it('should announce checked checkbox', () => {
      const dom = new JSDOM('<input type="checkbox" checked aria-label="Accept terms">');
      const checkbox = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(checkbox);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Accept terms, checkbox, checked');
    });

    it('should announce unchecked checkbox', () => {
      const dom = new JSDOM('<input type="checkbox" aria-label="Accept terms">');
      const checkbox = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(checkbox);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Accept terms, checkbox, not checked');
    });

    it('should announce mixed state checkbox', () => {
      const dom = new JSDOM('<input type="checkbox" aria-checked="mixed" aria-label="Select all">');
      const checkbox = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(checkbox);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Select all, checkbox, half checked');
    });
  });

  describe('textbox announcements', () => {
    it('should announce textbox with value', () => {
      const dom = new JSDOM('<input type="text" value="John Doe" aria-label="Name">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Name, edit, John Doe');
    });

    it('should announce required textbox', () => {
      const dom = new JSDOM('<input type="text" required aria-label="Email">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Email, edit, required');
    });

    it('should announce invalid textbox', () => {
      const dom = new JSDOM('<input type="text" aria-invalid="true" aria-label="Email">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Email, edit, invalid entry');
    });

    it('should announce readonly textbox', () => {
      const dom = new JSDOM('<input type="text" readonly value="Read only" aria-label="Status">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Status, edit, read only, Read only');
    });
  });

  describe('landmark announcements', () => {
    it('should announce navigation landmark', () => {
      const dom = new JSDOM('<nav aria-label="Main navigation"></nav>');
      const nav = dom.window.document.querySelector('nav')!;
      const result = buildAccessibilityTree(nav);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Main navigation, navigation landmark');
    });

    it('should announce main landmark', () => {
      const dom = new JSDOM('<main></main>');
      const main = dom.window.document.querySelector('main')!;
      const result = buildAccessibilityTree(main);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('main landmark');
    });

    it('should announce banner landmark', () => {
      const dom = new JSDOM('<header></header>');
      const header = dom.window.document.querySelector('header')!;
      const result = buildAccessibilityTree(header);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('banner landmark');
    });

    it('should announce contentinfo landmark', () => {
      const dom = new JSDOM('<footer></footer>');
      const footer = dom.window.document.querySelector('footer')!;
      const result = buildAccessibilityTree(footer);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('content information landmark');
    });

    it('should announce complementary landmark', () => {
      const dom = new JSDOM('<aside aria-label="Related links"></aside>');
      const aside = dom.window.document.querySelector('aside')!;
      const result = buildAccessibilityTree(aside);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Related links, complementary landmark');
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
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('list');
      expect(announcement).toContain('Item 1, list item');
      expect(announcement).toContain('Item 2, list item');
      expect(announcement).toContain('Item 3, list item');
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
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Main, navigation landmark');
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
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('article');
      expect(announcement).toContain('Article Title, heading level 2');
      expect(announcement).toContain('Read more, button, collapsed');
    });
  });

  describe('multiple states', () => {
    it('should announce button with multiple states', () => {
      const dom = new JSDOM('<button aria-expanded="true" aria-pressed="true">Toggle Menu</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Toggle Menu, button, expanded, pressed');
    });

    it('should announce textbox with multiple states', () => {
      const dom = new JSDOM('<input type="text" required aria-invalid="true" aria-label="Email">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toContain('Email');
      expect(announcement).toContain('edit');
      expect(announcement).toContain('invalid entry');
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
      
      const announcement = renderNVDA(result.model);
      
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
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Option A, radio button, checked');
    });
  });

  describe('image announcements', () => {
    it('should announce image with alt text', () => {
      const dom = new JSDOM('<img src="logo.png" alt="Company Logo">');
      const img = dom.window.document.querySelector('img')!;
      const result = buildAccessibilityTree(img);
      
      const announcement = renderNVDA(result.model);
      
      expect(announcement).toBe('Company Logo, graphic');
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
      
      const announcement = renderNVDA(result.model);
      
      // Generic container should not be announced
      expect(announcement).not.toContain('generic');
      // But children should be announced
      expect(announcement).toContain('Button 1, button');
      expect(announcement).toContain('Button 2, button');
    });
  });
});
