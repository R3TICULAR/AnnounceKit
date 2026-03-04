/**
 * Unit tests for model validation functions.
 */

import { describe, test, expect } from 'vitest';
import {
  validateRole,
  validateState,
  validateTreeStructure,
  validateModel,
  ValidationError,
} from '../../../src/model/validation.js';
import type {
  AccessibleNode,
  AccessibleState,
  AnnouncementModel,
} from '../../../src/model/types.js';

describe('validateRole', () => {
  test('accepts valid roles', () => {
    expect(() => validateRole('button')).not.toThrow();
    expect(() => validateRole('link')).not.toThrow();
    expect(() => validateRole('heading')).not.toThrow();
    expect(() => validateRole('textbox')).not.toThrow();
  });

  test('rejects invalid roles', () => {
    expect(() => validateRole('invalid-role')).toThrow(ValidationError);
    expect(() => validateRole('custom-role')).toThrow(ValidationError);
    expect(() => validateRole('')).toThrow(ValidationError);
  });

  test('provides helpful error message for invalid roles', () => {
    try {
      validateRole('invalid');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as Error).message).toContain('Invalid role');
      expect((error as Error).message).toContain('Supported roles');
    }
  });
});

describe('validateState', () => {
  test('accepts valid heading levels', () => {
    expect(() => validateState({ level: 1 })).not.toThrow();
    expect(() => validateState({ level: 6 })).not.toThrow();
    expect(() => validateState({ level: 3 })).not.toThrow();
  });

  test('rejects invalid heading levels', () => {
    expect(() => validateState({ level: 0 })).toThrow(ValidationError);
    expect(() => validateState({ level: 7 })).toThrow(ValidationError);
    expect(() => validateState({ level: -1 })).toThrow(ValidationError);
    expect(() => validateState({ level: 1.5 })).toThrow(ValidationError);
  });

  test('accepts valid posinset and setsize', () => {
    expect(() => validateState({ posinset: 1, setsize: 10 })).not.toThrow();
    expect(() => validateState({ posinset: 5, setsize: 5 })).not.toThrow();
  });

  test('rejects invalid posinset', () => {
    expect(() => validateState({ posinset: 0 })).toThrow(ValidationError);
    expect(() => validateState({ posinset: -1 })).toThrow(ValidationError);
    expect(() => validateState({ posinset: 1.5 })).toThrow(ValidationError);
  });

  test('rejects invalid setsize', () => {
    expect(() => validateState({ setsize: 0 })).toThrow(ValidationError);
    expect(() => validateState({ setsize: -1 })).toThrow(ValidationError);
  });

  test('rejects posinset > setsize', () => {
    expect(() => validateState({ posinset: 10, setsize: 5 })).toThrow(ValidationError);
  });

  test('accepts valid checked values', () => {
    expect(() => validateState({ checked: true })).not.toThrow();
    expect(() => validateState({ checked: false })).not.toThrow();
    expect(() => validateState({ checked: 'mixed' })).not.toThrow();
  });

  test('rejects invalid checked values', () => {
    expect(() => validateState({ checked: 'invalid' as any })).toThrow(ValidationError);
  });

  test('accepts valid pressed values', () => {
    expect(() => validateState({ pressed: true })).not.toThrow();
    expect(() => validateState({ pressed: false })).not.toThrow();
    expect(() => validateState({ pressed: 'mixed' })).not.toThrow();
  });

  test('rejects invalid pressed values', () => {
    expect(() => validateState({ pressed: 'invalid' as any })).toThrow(ValidationError);
  });

  test('accepts valid current values', () => {
    expect(() => validateState({ current: 'page' })).not.toThrow();
    expect(() => validateState({ current: 'step' })).not.toThrow();
    expect(() => validateState({ current: false })).not.toThrow();
  });

  test('rejects invalid current values', () => {
    expect(() => validateState({ current: 'invalid' as any })).toThrow(ValidationError);
  });
});

describe('validateTreeStructure', () => {
  test('accepts valid simple tree', () => {
    const node: AccessibleNode = {
      role: 'button',
      name: 'Click me',
      state: {},
      focus: { focusable: true },
      children: [],
    };

    expect(() => validateTreeStructure(node)).not.toThrow();
  });

  test('accepts valid nested tree', () => {
    const node: AccessibleNode = {
      role: 'list',
      name: 'Items',
      state: {},
      focus: { focusable: false },
      children: [
        {
          role: 'listitem',
          name: 'Item 1',
          state: {},
          focus: { focusable: false },
          children: [],
        },
        {
          role: 'listitem',
          name: 'Item 2',
          state: {},
          focus: { focusable: false },
          children: [],
        },
      ],
    };

    expect(() => validateTreeStructure(node)).not.toThrow();
  });

  test('detects circular references', () => {
    const node: AccessibleNode = {
      role: 'button',
      name: 'Click me',
      state: {},
      focus: { focusable: true },
      children: [],
    };

    // Create circular reference
    node.children.push(node);

    expect(() => validateTreeStructure(node)).toThrow(ValidationError);
    expect(() => validateTreeStructure(node)).toThrow(/circular reference/i);
  });

  test('validates roles in nested nodes', () => {
    const node: AccessibleNode = {
      role: 'list',
      name: 'Items',
      state: {},
      focus: { focusable: false },
      children: [
        {
          role: 'invalid-role' as any,
          name: 'Item 1',
          state: {},
          focus: { focusable: false },
          children: [],
        },
      ],
    };

    expect(() => validateTreeStructure(node)).toThrow(ValidationError);
  });

  test('validates state in nested nodes', () => {
    const node: AccessibleNode = {
      role: 'list',
      name: 'Items',
      state: {},
      focus: { focusable: false },
      children: [
        {
          role: 'listitem',
          name: 'Item 1',
          state: { level: 10 }, // Invalid level
          focus: { focusable: false },
          children: [],
        },
      ],
    };

    expect(() => validateTreeStructure(node)).toThrow(ValidationError);
  });
});

describe('validateModel', () => {
  test('accepts valid model', () => {
    const model: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: new Date().toISOString(),
      },
    };

    expect(() => validateModel(model)).not.toThrow();
  });

  test('rejects model without version', () => {
    const model = {
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: new Date().toISOString(),
      },
    } as any;

    expect(() => validateModel(model)).toThrow(ValidationError);
  });

  test('rejects model without metadata', () => {
    const model = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
    } as any;

    expect(() => validateModel(model)).toThrow(ValidationError);
  });

  test('rejects model with invalid timestamp', () => {
    const model: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: 'invalid-timestamp',
      },
    };

    expect(() => validateModel(model)).toThrow(ValidationError);
  });

  test('rejects model without root', () => {
    const model = {
      version: { major: 1, minor: 0 },
      metadata: {
        extractedAt: new Date().toISOString(),
      },
    } as any;

    expect(() => validateModel(model)).toThrow(ValidationError);
  });

  test('validates root node structure', () => {
    const model: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'invalid-role' as any,
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: new Date().toISOString(),
      },
    };

    expect(() => validateModel(model)).toThrow(ValidationError);
  });
});
