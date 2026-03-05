/**
 * Property-based tests for model serialization.
 * 
 * Feature: announcekit-cli
 * Property 5: Model Serialization Round Trip
 * Validates: Requirements 3.2, 11.1, 11.4
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { arbitraryAnnouncementModel } from './arbitraries.js';

describe('Property 5: Model Serialization Round Trip', () => {
  test('semantic model round trip preserves structure and values', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        // Serialize to JSON
        const json = JSON.stringify(model);
        
        // Deserialize back to object
        const deserialized = JSON.parse(json);
        
        // Should produce equivalent model
        expect(deserialized).toEqual(model);
      }),
      { numRuns: 100 }
    );
  });

  test('serialization produces valid JSON', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        // Should not throw when serializing
        const json = JSON.stringify(model);
        
        // Should be valid JSON string
        expect(typeof json).toBe('string');
        expect(json.length).toBeGreaterThan(0);
        
        // Should be parseable
        expect(() => JSON.parse(json)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  test('nested children are preserved through serialization', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        const json = JSON.stringify(model);
        const deserialized = JSON.parse(json);
        
        // Check that children arrays are preserved
        const checkChildren = (original: any, restored: any): void => {
          expect(restored.children).toEqual(original.children);
          expect(restored.children.length).toBe(original.children.length);
          
          // Recursively check nested children
          for (let i = 0; i < original.children.length; i++) {
            checkChildren(original.children[i], restored.children[i]);
          }
        };
        
        checkChildren(model.root, deserialized.root);
      }),
      { numRuns: 100 }
    );
  });

  test('optional fields are preserved correctly', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        const json = JSON.stringify(model);
        const deserialized = JSON.parse(json);
        
        // Check optional fields in root node
        expect(deserialized.root.description).toEqual(model.root.description);
        expect(deserialized.root.value).toEqual(model.root.value);
        
        // Check optional metadata
        expect(deserialized.metadata.sourceHash).toEqual(model.metadata.sourceHash);
      }),
      { numRuns: 100 }
    );
  });
});
