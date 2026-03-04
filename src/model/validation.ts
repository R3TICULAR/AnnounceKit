/**
 * Validation functions for the Canonical Announcement Model.
 */

import type {
  AccessibleNode,
  AccessibleRole,
  AccessibleState,
  AnnouncementModel,
} from './types.js';
import { SUPPORTED_ROLES } from './types.js';

/**
 * Validation error class.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that a role is supported in V1.
 * 
 * @param role - The role to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateRole(role: string): role is AccessibleRole {
  if (!SUPPORTED_ROLES.includes(role as AccessibleRole)) {
    throw new ValidationError(
      `Invalid role: "${role}". Supported roles: ${SUPPORTED_ROLES.join(', ')}`
    );
  }
  return true;
}

/**
 * Validates accessible state constraints.
 * 
 * @param state - The state object to validate
 * @throws ValidationError if invalid
 */
export function validateState(state: AccessibleState): void {
  // Validate level is in range 1-6 for headings
  if (state.level !== undefined) {
    if (!Number.isInteger(state.level) || state.level < 1 || state.level > 6) {
      throw new ValidationError(
        `Invalid heading level: ${state.level}. Must be an integer between 1 and 6.`
      );
    }
  }

  // Validate posinset is positive
  if (state.posinset !== undefined) {
    if (!Number.isInteger(state.posinset) || state.posinset < 1) {
      throw new ValidationError(
        `Invalid posinset: ${state.posinset}. Must be a positive integer.`
      );
    }
  }

  // Validate setsize is positive
  if (state.setsize !== undefined) {
    if (!Number.isInteger(state.setsize) || state.setsize < 1) {
      throw new ValidationError(
        `Invalid setsize: ${state.setsize}. Must be a positive integer.`
      );
    }
  }

  // Validate posinset <= setsize if both present
  if (
    state.posinset !== undefined &&
    state.setsize !== undefined &&
    state.posinset > state.setsize
  ) {
    throw new ValidationError(
      `Invalid set position: posinset (${state.posinset}) cannot exceed setsize (${state.setsize}).`
    );
  }

  // Validate checked is boolean or 'mixed'
  if (state.checked !== undefined) {
    if (typeof state.checked !== 'boolean' && state.checked !== 'mixed') {
      throw new ValidationError(
        `Invalid checked value: ${state.checked}. Must be boolean or 'mixed'.`
      );
    }
  }

  // Validate pressed is boolean or 'mixed'
  if (state.pressed !== undefined) {
    if (typeof state.pressed !== 'boolean' && state.pressed !== 'mixed') {
      throw new ValidationError(
        `Invalid pressed value: ${state.pressed}. Must be boolean or 'mixed'.`
      );
    }
  }

  // Validate current is valid enum value
  if (state.current !== undefined) {
    const validCurrentValues = ['page', 'step', 'location', 'date', 'time', 'true', false];
    if (!validCurrentValues.includes(state.current as any)) {
      throw new ValidationError(
        `Invalid current value: ${state.current}. Must be one of: ${validCurrentValues.join(', ')}`
      );
    }
  }
}

/**
 * Validates tree structure integrity (no cycles).
 * 
 * @param node - The root node to validate
 * @param visited - Set of visited nodes (for cycle detection)
 * @throws ValidationError if cycles detected
 */
export function validateTreeStructure(
  node: AccessibleNode,
  visited: Set<AccessibleNode> = new Set()
): void {
  // Check for cycles
  if (visited.has(node)) {
    throw new ValidationError(
      'Circular reference detected in accessibility tree. Tree must be acyclic.'
    );
  }

  visited.add(node);

  // Validate role
  validateRole(node.role);

  // Validate state
  validateState(node.state);

  // Recursively validate children
  for (const child of node.children) {
    validateTreeStructure(child, new Set(visited));
  }
}

/**
 * Validates an entire AnnouncementModel.
 * 
 * @param model - The model to validate
 * @throws ValidationError if invalid
 */
export function validateModel(model: AnnouncementModel): void {
  // Validate version
  if (!model.version || typeof model.version.major !== 'number' || typeof model.version.minor !== 'number') {
    throw new ValidationError('Invalid model version. Must have major and minor number fields.');
  }

  // Validate metadata
  if (!model.metadata || !model.metadata.extractedAt) {
    throw new ValidationError('Invalid metadata. Must have extractedAt timestamp.');
  }

  // Validate timestamp is ISO 8601
  const timestamp = new Date(model.metadata.extractedAt);
  if (isNaN(timestamp.getTime())) {
    throw new ValidationError(
      `Invalid extractedAt timestamp: ${model.metadata.extractedAt}. Must be ISO 8601 format.`
    );
  }

  // Validate root node and tree structure
  if (!model.root) {
    throw new ValidationError('Model must have a root node.');
  }

  validateTreeStructure(model.root);
}
