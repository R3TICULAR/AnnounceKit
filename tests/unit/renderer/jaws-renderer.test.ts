/**
 * Unit tests for JAWS renderer.
 */

import { describe, it, expect } from 'vitest';
import { renderJAWS } from '../../../src/renderer/jaws-renderer.js';
import type { AnnouncementModel, AccessibleNode } from '../../../src/model/types.js';

describe('renderJAWS', () => {
  describe('basic role announcements', () => {
    it('should render button', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'button',
          name: 'Submit',
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Submit, button');
    });

    it('should render link with "clickable"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'link',
          name: 'Home',
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Home, clickable');
    });

    it('should render heading with level', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'heading',
          name: 'Welcome',
          state: { level: 1 },
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Welcome, heading 1');
    });

    it('should render textbox as "edit"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'textbox',
          name: 'Username',
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Username, edit');
    });

    it('should render checkbox as "check box"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'checkbox',
          name: 'Accept terms',
          state: { checked: false },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Accept terms, check box, not checked');
    });

    it('should render radio as "radio button"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'radio',
          name: 'Option A',
          state: { checked: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Option A, radio button, checked');
    });

    it('should render combobox as "combo box" (two words)', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'combobox',
          name: 'Country',
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Country, combo box');
    });

    it('should render listbox as "list box"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'listbox',
          name: 'Options',
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Options, list box');
    });

    it('should render image as "graphic"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'img',
          name: 'Company logo',
          state: {},
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Company logo, graphic');
    });
  });

  describe('landmark announcements', () => {
    it('should render navigation as "navigation region"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'navigation',
          name: 'Main navigation',
          state: {},
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Main navigation, navigation region');
    });

    it('should render main as "main region"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'main',
          name: 'Main content',
          state: {},
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Main content, main region');
    });

    it('should render banner as "banner region"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'banner',
          name: 'Site header',
          state: {},
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Site header, banner region');
    });

    it('should render contentinfo as "content information region"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'contentinfo',
          name: 'Site footer',
          state: {},
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Site footer, content information region');
    });

    it('should render search as "search region"', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'search',
          name: 'Site search',
          state: {},
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Site search, search region');
    });
  });

  describe('state announcements', () => {
    it('should announce expanded state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'button',
          name: 'Menu',
          state: { expanded: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Menu, button, expanded');
    });

    it('should announce collapsed state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'button',
          name: 'Menu',
          state: { expanded: false },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Menu, button, collapsed');
    });

    it('should announce checked checkbox', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'checkbox',
          name: 'Subscribe',
          state: { checked: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Subscribe, check box, checked');
    });

    it('should announce not checked checkbox', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'checkbox',
          name: 'Subscribe',
          state: { checked: false },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Subscribe, check box, not checked');
    });

    it('should announce partially checked (mixed) state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'checkbox',
          name: 'Select all',
          state: { checked: 'mixed' },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Select all, check box, partially checked');
    });

    it('should announce pressed state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'button',
          name: 'Mute',
          state: { pressed: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Mute, button, pressed');
    });

    it('should announce unavailable (disabled) state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'button',
          name: 'Submit',
          state: { disabled: true },
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Submit, button, unavailable');
    });

    it('should announce invalid entry state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'textbox',
          name: 'Email',
          state: { invalid: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Email, edit, invalid entry');
    });

    it('should announce required state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'textbox',
          name: 'Username',
          state: { required: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Username, edit, required');
    });

    it('should announce read only state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'textbox',
          name: 'ID',
          state: { readonly: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('ID, edit, read only');
    });

    it('should announce current page state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'link',
          name: 'About',
          state: { current: 'page' },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('About, clickable, current page');
    });
  });

  describe('value announcements', () => {
    it('should announce textbox value', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'textbox',
          name: 'Search',
          value: { current: 'accessibility' },
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Search, edit, accessibility');
    });

    it('should announce value text when present', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'textbox',
          name: 'Volume',
          value: { current: 50, text: '50%' },
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Volume, edit, 50%');
    });
  });

  describe('description announcements', () => {
    it('should announce description', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'button',
          name: 'Submit',
          description: 'Submit the form',
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Submit, button, Submit the form');
    });
  });

  describe('nested elements', () => {
    it('should render parent and children', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'list',
          name: 'Menu',
          state: {},
          focus: { focusable: false },
          children: [
            {
              role: 'listitem',
              name: 'Home',
              state: {},
              focus: { focusable: false },
              children: [],
            },
            {
              role: 'listitem',
              name: 'About',
              state: {},
              focus: { focusable: false },
              children: [],
            },
          ],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      expect(output).toBe('Menu, list\nHome, list item\nAbout, list item');
    });
  });

  describe('JAWS vs NVDA vs VoiceOver differences', () => {
    it('should use "clickable" for links (JAWS-specific)', () => {
      const node: AccessibleNode = {
        role: 'link',
        name: 'Home',
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: node,
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      // JAWS uses "clickable", NVDA/VoiceOver use "link"
      expect(output).toContain('clickable');
      expect(output).not.toContain(', link');
    });

    it('should use "combo box" (two words) for combobox', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'combobox',
          name: 'Country',
          state: {},
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      // JAWS uses "combo box" (two words)
      expect(output).toContain('combo box');
    });

    it('should use "check box" (two words) for checkbox', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'checkbox',
          name: 'Accept',
          state: { checked: false },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      // JAWS uses "check box" (two words)
      expect(output).toContain('check box');
    });

    it('should use "partially checked" for mixed state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'checkbox',
          name: 'Select all',
          state: { checked: 'mixed' },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      // JAWS uses "partially checked", NVDA uses "half checked"
      expect(output).toContain('partially checked');
    });

    it('should use "invalid entry" for invalid state', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'textbox',
          name: 'Email',
          state: { invalid: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      // JAWS uses "invalid entry"
      expect(output).toContain('invalid entry');
    });

    it('should use "radio button" for radio', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'radio',
          name: 'Option A',
          state: { checked: true },
          focus: { focusable: true },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      // JAWS uses "radio button"
      expect(output).toContain('radio button');
    });
  });

  describe('generic containers', () => {
    it('should not announce generic role', () => {
      const model: AnnouncementModel = {
        version: { major: 1, minor: 0 },
        root: {
          role: 'generic',
          name: 'Container',
          state: {},
          focus: { focusable: false },
          children: [],
        },
        metadata: { extractedAt: '2024-01-01T00:00:00Z' },
      };

      const output = renderJAWS(model);

      // Generic containers should only announce name, not role
      expect(output).toBe('Container');
    });
  });
});
