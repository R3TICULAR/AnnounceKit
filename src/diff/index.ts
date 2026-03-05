/**
 * Semantic diff module for comparing accessibility trees.
 */

export { diffAccessibilityTrees, describeChange } from './diff-algorithm.js';
export { 
  formatDiffAsJSON, 
  formatDiffAsText, 
  formatDiffForCI,
  hasAccessibilityRegression 
} from './formatter.js';
export type { SemanticDiff, NodeChange, PropertyChange, NodePath, ChangeType } from './types.js';
