/**
 * Semantic diff algorithm for accessibility trees.
 * 
 * Compares two accessibility trees and identifies:
 * - Added nodes (present in new tree, not in old)
 * - Removed nodes (present in old tree, not in new)
 * - Changed nodes (same path, different properties)
 */

import type { AccessibleNode, AccessibleState, AccessibleValue, FocusInfo } from '../model/types.js';
import type { SemanticDiff, NodeChange, PropertyChange, NodePath } from './types.js';

/**
 * Compare two accessibility trees and generate a semantic diff.
 * 
 * @param oldTree - The original accessibility tree
 * @param newTree - The updated accessibility tree
 * @returns Semantic diff with all detected changes
 */
export function diffAccessibilityTrees(
  oldTree: AccessibleNode,
  newTree: AccessibleNode
): SemanticDiff {
  const changes: NodeChange[] = [];
  
  // Build maps of path -> node for both trees
  const oldNodes = buildNodeMap(oldTree, 'root');
  const newNodes = buildNodeMap(newTree, 'root');
  
  // Find removed nodes (in old but not in new)
  for (const [path, node] of oldNodes) {
    if (!newNodes.has(path)) {
      changes.push({
        type: 'removed',
        path,
        node,
      });
    }
  }
  
  // Find added nodes (in new but not in old)
  for (const [path, node] of newNodes) {
    if (!oldNodes.has(path)) {
      changes.push({
        type: 'added',
        path,
        node,
      });
    }
  }
  
  // Find changed nodes (in both but with different properties)
  for (const [path, oldNode] of oldNodes) {
    const newNode = newNodes.get(path);
    if (newNode) {
      const propertyChanges = compareNodes(oldNode, newNode);
      if (propertyChanges.length > 0) {
        changes.push({
          type: 'changed',
          path,
          changes: propertyChanges,
        });
      }
    }
  }
  
  // Sort changes by path for deterministic output
  changes.sort((a, b) => a.path.localeCompare(b.path));
  
  // Calculate summary statistics
  const summary = {
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    changed: changes.filter(c => c.type === 'changed').length,
    total: changes.length,
  };
  
  return { changes, summary };
}

/**
 * Build a map of path -> node for a tree.
 * 
 * @param node - Root node of the tree
 * @param path - Current path (starts with 'root')
 * @returns Map of paths to nodes
 */
function buildNodeMap(
  node: AccessibleNode,
  path: NodePath
): Map<NodePath, AccessibleNode> {
  const map = new Map<NodePath, AccessibleNode>();
  
  // Add current node
  map.set(path, node);
  
  // Recursively add children
  node.children.forEach((child, index) => {
    const childPath = `${path}.children[${index}]`;
    const childMap = buildNodeMap(child, childPath);
    for (const [childPath, childNode] of childMap) {
      map.set(childPath, childNode);
    }
  });
  
  return map;
}

/**
 * Compare two nodes and identify property changes.
 * 
 * @param oldNode - Original node
 * @param newNode - Updated node
 * @returns Array of property changes
 */
function compareNodes(
  oldNode: AccessibleNode,
  newNode: AccessibleNode
): PropertyChange[] {
  const changes: PropertyChange[] = [];
  
  // Compare role
  if (oldNode.role !== newNode.role) {
    changes.push({
      property: 'role',
      oldValue: oldNode.role,
      newValue: newNode.role,
    });
  }
  
  // Compare name
  if (oldNode.name !== newNode.name) {
    changes.push({
      property: 'name',
      oldValue: oldNode.name,
      newValue: newNode.name,
    });
  }
  
  // Compare description
  if (oldNode.description !== newNode.description) {
    changes.push({
      property: 'description',
      oldValue: oldNode.description,
      newValue: newNode.description,
    });
  }
  
  // Compare value
  if (!valuesEqual(oldNode.value, newNode.value)) {
    changes.push({
      property: 'value',
      oldValue: oldNode.value,
      newValue: newNode.value,
    });
  }
  
  // Compare state
  if (!statesEqual(oldNode.state, newNode.state)) {
    changes.push({
      property: 'state',
      oldValue: oldNode.state,
      newValue: newNode.state,
    });
  }
  
  // Compare focus
  if (!focusEqual(oldNode.focus, newNode.focus)) {
    changes.push({
      property: 'focus',
      oldValue: oldNode.focus,
      newValue: newNode.focus,
    });
  }
  
  return changes;
}

/**
 * Compare two AccessibleValue objects for equality.
 */
function valuesEqual(
  a: AccessibleValue | undefined,
  b: AccessibleValue | undefined
): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  
  return (
    a.current === b.current &&
    a.min === b.min &&
    a.max === b.max &&
    a.text === b.text
  );
}

/**
 * Compare two AccessibleState objects for equality.
 */
function statesEqual(
  a: AccessibleState,
  b: AccessibleState
): boolean {
  // Get all unique keys from both states
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  
  for (const key of keys) {
    const aValue = a[key as keyof AccessibleState];
    const bValue = b[key as keyof AccessibleState];
    
    if (aValue !== bValue) {
      return false;
    }
  }
  
  return true;
}

/**
 * Compare two FocusInfo objects for equality.
 */
function focusEqual(
  a: FocusInfo,
  b: FocusInfo
): boolean {
  return (
    a.focusable === b.focusable &&
    a.tabindex === b.tabindex
  );
}

/**
 * Generate a human-readable description of a change.
 * 
 * @param change - The change to describe
 * @returns Human-readable description
 */
export function describeChange(change: NodeChange): string {
  switch (change.type) {
    case 'added':
      return `Added ${change.node?.role} "${change.node?.name}" at ${change.path}`;
    
    case 'removed':
      return `Removed ${change.node?.role} "${change.node?.name}" from ${change.path}`;
    
    case 'changed': {
      const descriptions = change.changes?.map(pc => {
        const oldVal = formatValue(pc.oldValue);
        const newVal = formatValue(pc.newValue);
        return `${pc.property}: ${oldVal} → ${newVal}`;
      }) || [];
      return `Changed at ${change.path}: ${descriptions.join(', ')}`;
    }
    
    default:
      return `Unknown change at ${change.path}`;
  }
}

/**
 * Format a value for display in change descriptions.
 */
function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
