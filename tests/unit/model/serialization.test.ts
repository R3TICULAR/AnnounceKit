/**
 * Unit tests for model serialization functions.
 */

import { describe, test, expect } from 'vitest';
import {
  serializeModel,
  deserializeModel,
  createModel,
  modelsEqual,
  cloneModel,
} from '../../../src/model/serialization.js';
import type { AccessibleNode, AnnouncementModel } from '../../../src/model/types.js';
import { ValidationError } from '../../../src/model/validation.js';

describe('serializeModel', () => {
  test('serializes simple model to JSON', () => {
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
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    const json = serializeModel(model);
    expect(json).toBeTruthy();
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  test('serializes model with optional fields', () => {
    const model: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'textbox',
        name: 'Email',
        description: 'Enter your email address',
        value: { current: 'test@example.com', text: 'test@example.com' },
        state: { required: true, invalid: false },
        focus: { focusable: true, tabindex: 0 },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
        sourceHash: 'abc123',
      },
    };

    const json = serializeModel(model);
    const parsed = JSON.parse(json);
    
    expect(parsed.root.description).toBe('Enter your email address');
    expect(parsed.root.value).toEqual({ current: 'test@example.com', text: 'test@example.com' });
    expect(parsed.metadata.sourceHash).toBe('abc123');
  });

  test('serializes deeply nested model', () => {
    const model: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
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
            children: [
              {
                role: 'button',
                name: 'Delete',
                state: {},
                focus: { focusable: true },
                children: [],
              },
            ],
          },
        ],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    const json = serializeModel(model);
    const parsed = JSON.parse(json);
    
    expect(parsed.root.children).toHaveLength(1);
    expect(parsed.root.children[0].children).toHaveLength(1);
    expect(parsed.root.children[0].children[0].role).toBe('button');
  });

  test('pretty option formats JSON with indentation', () => {
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
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    const json = serializeModel(model, { pretty: true });
    
    expect(json).toContain('\n');
    expect(json).toContain('  ');
  });

  test('throws ValidationError for invalid model when validation enabled', () => {
    const invalidModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'invalid-role',
        name: 'Test',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    } as any;

    expect(() => serializeModel(invalidModel, { validate: true })).toThrow(ValidationError);
  });

  test('does not validate when validation disabled', () => {
    const invalidModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'invalid-role',
        name: 'Test',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    } as any;

    expect(() => serializeModel(invalidModel, { validate: false })).not.toThrow();
  });
});

describe('deserializeModel', () => {
  test('deserializes valid JSON to model', () => {
    const json = JSON.stringify({
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    });

    const model = deserializeModel(json);
    
    expect(model.version).toEqual({ major: 1, minor: 0 });
    expect(model.root.role).toBe('button');
    expect(model.root.name).toBe('Click me');
  });

  test('throws SyntaxError for invalid JSON', () => {
    const invalidJson = '{ invalid json }';
    
    expect(() => deserializeModel(invalidJson)).toThrow(SyntaxError);
  });

  test('throws ValidationError for invalid model when validation enabled', () => {
    const json = JSON.stringify({
      version: { major: 1, minor: 0 },
      root: {
        role: 'invalid-role',
        name: 'Test',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    });

    expect(() => deserializeModel(json, { validate: true })).toThrow(ValidationError);
  });

  test('does not validate when validation disabled', () => {
    const json = JSON.stringify({
      version: { major: 1, minor: 0 },
      root: {
        role: 'invalid-role',
        name: 'Test',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    });

    expect(() => deserializeModel(json, { validate: false })).not.toThrow();
  });

  test('preserves optional fields', () => {
    const json = JSON.stringify({
      version: { major: 1, minor: 0 },
      root: {
        role: 'textbox',
        name: 'Email',
        description: 'Enter email',
        value: { current: 'test@example.com' },
        state: { required: true },
        focus: { focusable: true, tabindex: 0 },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
        sourceHash: 'abc123',
      },
    });

    const model = deserializeModel(json);
    
    expect(model.root.description).toBe('Enter email');
    expect(model.root.value).toEqual({ current: 'test@example.com' });
    expect(model.metadata.sourceHash).toBe('abc123');
  });
});

describe('createModel', () => {
  test('creates model with current version and timestamp', () => {
    const root: AccessibleNode = {
      role: 'button',
      name: 'Click me',
      state: {},
      focus: { focusable: true },
      children: [],
    };

    const model = createModel(root);
    
    expect(model.version).toEqual({ major: 1, minor: 0 });
    expect(model.root).toBe(root);
    expect(model.metadata.extractedAt).toBeTruthy();
    
    // Verify timestamp is valid ISO 8601
    const timestamp = new Date(model.metadata.extractedAt);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  test('includes sourceHash when provided', () => {
    const root: AccessibleNode = {
      role: 'button',
      name: 'Click me',
      state: {},
      focus: { focusable: true },
      children: [],
    };

    const model = createModel(root, 'abc123');
    
    expect(model.metadata.sourceHash).toBe('abc123');
  });

  test('omits sourceHash when not provided', () => {
    const root: AccessibleNode = {
      role: 'button',
      name: 'Click me',
      state: {},
      focus: { focusable: true },
      children: [],
    };

    const model = createModel(root);
    
    expect(model.metadata.sourceHash).toBeUndefined();
  });
});

describe('modelsEqual', () => {
  test('returns true for identical models', () => {
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
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    expect(modelsEqual(model, model)).toBe(true);
  });

  test('returns true for equivalent models', () => {
    const model1: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    const model2: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    expect(modelsEqual(model1, model2)).toBe(true);
  });

  test('returns false for different models', () => {
    const model1: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    const model2: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'link',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    expect(modelsEqual(model1, model2)).toBe(false);
  });
});

describe('cloneModel', () => {
  test('creates deep copy of model', () => {
    const original: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    const clone = cloneModel(original);
    
    expect(clone).not.toBe(original);
    expect(clone.root).not.toBe(original.root);
    expect(modelsEqual(clone, original)).toBe(true);
  });

  test('clone is independent of original', () => {
    const original: AnnouncementModel = {
      version: { major: 1, minor: 0 },
      root: {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
      metadata: {
        extractedAt: '2024-01-15T10:30:00.000Z',
      },
    };

    const clone = cloneModel(original);
    
    // Modify clone
    clone.root.name = 'Modified';
    
    // Original should be unchanged
    expect(original.root.name).toBe('Click me');
    expect(clone.root.name).toBe('Modified');
  });
});
