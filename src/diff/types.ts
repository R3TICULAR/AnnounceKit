/**
 * Semantic diff types for comparing accessibility trees.
 */

import type { AccessibleNode } from '../model/types.js';

/**
 * Type of change detected in the diff.
 */
export type ChangeType = 'added' | 'removed' | 'changed';

/**
 * JSON path to a node in the tree (e.g., "root.children[0].children[1]").
 */
export type NodePath = string;

/**
 * Details about what changed in a node.
 */
export interface PropertyChange {
  /** Property that changed */
  property: 'role' | 'name' | 'description' | 'value' | 'state' | 'focus';
  
  /** Old value (undefined for added nodes) */
  oldValue?: unknown;
  
  /** New value (undefined for removed nodes) */
  newValue?: unknown;
}

/**
 * A single change in the accessibility tree.
 */
export interface NodeChange {
  /** Type of change */
  type: ChangeType;
  
  /** JSON path to the node */
  path: NodePath;
  
  /** The node itself (for added/removed) or property changes (for changed) */
  node?: AccessibleNode;
  
  /** Specific property changes (only for type='changed') */
  changes?: PropertyChange[];
}

/**
 * Complete diff between two accessibility trees.
 */
export interface SemanticDiff {
  /** All detected changes */
  changes: NodeChange[];
  
  /** Summary statistics */
  summary: {
    added: number;
    removed: number;
    changed: number;
    total: number;
  };
}
