/**
 * Property-based tests for deterministic output.
 * 
 * Feature: speakable-cli
 * Property 6: Deterministic Output
 * Validates: Requirements 3.3, 3.5
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { arbitraryAnnouncementModel } from './arbitraries.js';
import { serializeModel } from '../../src/model/serialization.js';

describe('Property 6: Deterministic Output', () => {
  test('same model serializes to identical JSON multiple times', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        // Serialize the same model multiple times
        const json1 = serializeModel(model, { validate: false });
        const json2 = serializeModel(model, { validate: false });
        const json3 = serializeModel(model, { validate: false });
        
        // All serializations should be byte-identical
        expect(json1).toBe(json2);
        expect(json2).toBe(json3);
        expect(json1).toBe(json3);
      }),
      { numRuns: 100 }
    );
  });

  test('property ordering is consistent across serializations', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        const json = serializeModel(model, { validate: false });
        const parsed = JSON.parse(json);
        
        // Check that top-level keys are in sorted order
        const keys = Object.keys(parsed);
        const sortedKeys = [...keys].sort();
        expect(keys).toEqual(sortedKeys);
        
        // Check that metadata keys are sorted
        const metadataKeys = Object.keys(parsed.metadata);
        const sortedMetadataKeys = [...metadataKeys].sort();
        expect(metadataKeys).toEqual(sortedMetadataKeys);
      }),
      { numRuns: 100 }
    );
  });

  test('no randomness in serialization output', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        // Create multiple independent serializations
        const serializations = Array.from({ length: 5 }, () =>
          serializeModel(model, { validate: false })
        );
        
        // All should be identical
        const first = serializations[0];
        for (const json of serializations) {
          expect(json).toBe(first);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('serialization is byte-identical for equivalent models', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        // Create a deep copy by serializing and deserializing
        const json1 = serializeModel(model, { validate: false });
        const copy = JSON.parse(json1);
        const json2 = serializeModel(copy, { validate: false });
        
        // Serializations should be identical
        expect(json1).toBe(json2);
      }),
      { numRuns: 100 }
    );
  });

  test('nested objects have sorted keys', () => {
    fc.assert(
      fc.property(arbitraryAnnouncementModel(), (model) => {
        const json = serializeModel(model, { validate: false });
        const parsed = JSON.parse(json);
        
        // Recursively check that all object keys are sorted
        const checkSorted = (obj: any): void => {
          if (obj === null || typeof obj !== 'object') {
            return;
          }
          
          if (Array.isArray(obj)) {
            obj.forEach(checkSorted);
            return;
          }
          
          const keys = Object.keys(obj);
          const sortedKeys = [...keys].sort();
          expect(keys).toEqual(sortedKeys);
          
          // Recursively check nested objects
          for (const key of keys) {
            checkSorted(obj[key]);
          }
        };
        
        checkSorted(parsed);
      }),
      { numRuns: 100 }
    );
  });
});
