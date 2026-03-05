/**
 * Accessibility tree builder.
 * 
 * Builds the complete accessibility tree from a DOM tree by integrating
 * all extraction components (role, name, description, state, value, focus).
 */

import type { AccessibleNode, AnnouncementModel } from '../model/types.js';
import { CURRENT_MODEL_VERSION } from '../model/types.js';
import { computeAccessibleName, computeAccessibleDescription } from './aria-name.js';
import { computeRole, isAccessible } from './role-mapper.js';
import { extractState, extractValue } from './state-extractor.js';
import { extractFocusInfo } from './focus-extractor.js';

/**
 * Warning emitted during tree building.
 */
export interface TreeBuildWarning {
  message: string;
  element: Element;
}

/**
 * Result of tree building.
 */
export interface TreeBuildResult {
  model: AnnouncementModel;
  warnings: TreeBuildWarning[];
}

/**
 * Builds an accessibility tree from a DOM element.
 * 
 * Traverses the DOM tree depth-first, applies all extractors,
 * filters inaccessible elements, and builds the hierarchical tree.
 * 
 * @param rootElement - Root DOM element to build tree from
 * @param sourceHash - Optional hash of source HTML for change detection
 * @returns Announcement model and warnings
 */
export function buildAccessibilityTree(
  rootElement: Element,
  sourceHash?: string
): TreeBuildResult {
  const warnings: TreeBuildWarning[] = [];
  
  // Build the root node
  const rootNode = buildNodeRecursive(rootElement, warnings);
  
  // If root element is not accessible, create a generic container
  const accessibleRoot = rootNode || createGenericContainer(rootElement, warnings);
  
  // Create the announcement model
  const model: AnnouncementModel = {
    version: CURRENT_MODEL_VERSION,
    root: accessibleRoot,
    metadata: {
      extractedAt: new Date().toISOString(),
      ...(sourceHash && { sourceHash }),
    },
  };
  
  return { model, warnings };
}

/**
 * Recursively builds an accessible node from a DOM element.
 * 
 * @param element - DOM element to build node from
 * @param warnings - Array to collect warnings
 * @returns Accessible node or null if element is not accessible
 */
function buildNodeRecursive(
  element: Element,
  warnings: TreeBuildWarning[]
): AccessibleNode | null {
  // Check if element should be included in accessibility tree
  if (!isAccessible(element)) {
    return null;
  }
  
  // Extract role
  const roleResult = computeRole(element);
  warnings.push(...roleResult.warnings.map(w => ({
    message: w.message,
    element: w.element,
  })));
  
  // If no role, element is not accessible
  if (!roleResult.role) {
    return null;
  }
  
  // Extract accessible name
  const nameResult = computeAccessibleName(element);
  warnings.push(...nameResult.warnings.map(w => ({
    message: w.message,
    element: w.element,
  })));
  
  // Extract accessible description
  const descResult = computeAccessibleDescription(element);
  warnings.push(...descResult.warnings.map(w => ({
    message: w.message,
    element: w.element,
  })));
  
  // Extract state
  const stateResult = extractState(element);
  warnings.push(...stateResult.warnings.map(w => ({
    message: w.message,
    element: w.element,
  })));
  
  // Extract value
  const valueResult = extractValue(element);
  warnings.push(...valueResult.warnings.map(w => ({
    message: w.message,
    element: w.element,
  })));
  
  // Extract focus info
  const focusInfo = extractFocusInfo(element);
  
  // Build children
  const children: AccessibleNode[] = [];
  for (const child of Array.from(element.children)) {
    const childNode = buildNodeRecursive(child, warnings);
    if (childNode) {
      children.push(childNode);
    }
  }
  
  // Create the accessible node
  const node: AccessibleNode = {
    role: roleResult.role,
    name: nameResult.name,
    ...(descResult.description && { description: descResult.description }),
    ...(valueResult.value && { value: valueResult.value }),
    state: stateResult.state,
    focus: focusInfo,
    children,
  };
  
  return node;
}

/**
 * Creates a generic container node when root element is not accessible.
 * 
 * This ensures we always have a valid root node even if the root element
 * itself is not accessible (e.g., a plain div).
 * 
 * @param rootElement - Root DOM element
 * @param warnings - Array to collect warnings
 * @returns Generic container node with accessible children
 */
function createGenericContainer(
  rootElement: Element,
  warnings: TreeBuildWarning[]
): AccessibleNode {
  // Build children from root element
  const children: AccessibleNode[] = [];
  for (const child of Array.from(rootElement.children)) {
    const childNode = buildNodeRecursive(child, warnings);
    if (childNode) {
      children.push(childNode);
    }
  }
  
  // Create a generic container
  return {
    role: 'generic',
    name: '',
    state: {},
    focus: {
      focusable: false,
    },
    children,
  };
}
