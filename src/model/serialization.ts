/**
 * JSON serialization and deserialization for the Canonical Announcement Model.
 * 
 * Ensures deterministic output with consistent property ordering.
 */

import type { AnnouncementModel, AccessibleNode } from './types.js';
import { CURRENT_MODEL_VERSION } from './types.js';
import { validateModel } from './validation.js';

/**
 * Serialization options.
 */
export interface SerializationOptions {
  /** Whether to pretty-print the JSON output */
  pretty?: boolean;
  
  /** Whether to validate the model before serialization */
  validate?: boolean;
}

/**
 * Deserialization options.
 */
export interface DeserializationOptions {
  /** Whether to validate the model after deserialization */
  validate?: boolean;
}

/**
 * Sorts object keys to ensure deterministic JSON output.
 * 
 * @param obj - Object to sort
 * @returns New object with sorted keys
 */
function sortObjectKeys<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys) as any as T;
  }

  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    const value = obj[key];
    sorted[key] = typeof value === 'object' && value !== null 
      ? sortObjectKeys(value) 
      : value;
  }

  return sorted as T;
}

/**
 * Serializes an AnnouncementModel to JSON string.
 * 
 * Produces deterministic output with consistent property ordering.
 * 
 * @param model - The model to serialize
 * @param options - Serialization options
 * @returns JSON string representation
 * @throws ValidationError if validation is enabled and model is invalid
 */
export function serializeModel(
  model: AnnouncementModel,
  options: SerializationOptions = {}
): string {
  const { pretty = false, validate = true } = options;

  // Validate model if requested
  if (validate) {
    validateModel(model);
  }

  // Sort keys for deterministic output
  const sorted = sortObjectKeys(model);

  // Serialize with optional pretty printing
  return pretty 
    ? JSON.stringify(sorted, null, 2)
    : JSON.stringify(sorted);
}

/**
 * Deserializes a JSON string to an AnnouncementModel.
 * 
 * @param json - JSON string to deserialize
 * @param options - Deserialization options
 * @returns Parsed AnnouncementModel
 * @throws SyntaxError if JSON is invalid
 * @throws ValidationError if validation is enabled and model is invalid
 */
export function deserializeModel(
  json: string,
  options: DeserializationOptions = {}
): AnnouncementModel {
  const { validate = true } = options;

  // Parse JSON
  const model = JSON.parse(json) as AnnouncementModel;

  // Validate model if requested
  if (validate) {
    validateModel(model);
  }

  return model;
}

/**
 * Creates a new AnnouncementModel with current version and timestamp.
 * 
 * @param root - Root accessible node
 * @param sourceHash - Optional hash of source HTML
 * @returns New AnnouncementModel
 */
export function createModel(
  root: AccessibleNode,
  sourceHash?: string
): AnnouncementModel {
  return {
    version: { ...CURRENT_MODEL_VERSION },
    root,
    metadata: {
      extractedAt: new Date().toISOString(),
      ...(sourceHash && { sourceHash }),
    },
  };
}

/**
 * Compares two models for equality (deep comparison).
 * 
 * @param a - First model
 * @param b - Second model
 * @returns true if models are equivalent
 */
export function modelsEqual(a: AnnouncementModel, b: AnnouncementModel): boolean {
  // Simple approach: serialize both and compare strings
  // This works because serialization is deterministic
  const jsonA = serializeModel(a, { validate: false });
  const jsonB = serializeModel(b, { validate: false });
  return jsonA === jsonB;
}

/**
 * Clones a model (deep copy).
 * 
 * @param model - Model to clone
 * @returns Deep copy of the model
 */
export function cloneModel(model: AnnouncementModel): AnnouncementModel {
  const json = serializeModel(model, { validate: false });
  return deserializeModel(json, { validate: false });
}
