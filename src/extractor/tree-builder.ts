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
 * Error thrown when selector filtering fails.
 */
export class SelectorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SelectorError';
  }
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
 * Builds accessibility trees for elements matching a CSS selector.
 * 
 * Uses querySelector/querySelectorAll to find matching elements,
 * then builds an accessibility tree for each match.
 * 
 * @param rootElement - Root DOM element to search within
 * @param selector - CSS selector to match elements
 * @param sourceHash - Optional hash of source HTML for change detection
 * @returns Array of announcement models and warnings
 * @throws SelectorError if no elements match the selector
 */
export function buildAccessibilityTreeWithSelector(
  rootElement: Element,
  selector: string,
  sourceHash?: string
): TreeBuildResult[] {
  const document = rootElement.ownerDocument;
  if (!document) {
    throw new SelectorError('Element has no owner document');
  }
  
  // Find all matching elements
  let matchingElements: Element[];
  try {
    // Check if rootElement itself matches
    if (rootElement.matches(selector)) {
      matchingElements = [rootElement];
    } else {
      // Query for matching descendants
      matchingElements = Array.from(rootElement.querySelectorAll(selector));
    }
  } catch (error) {
    throw new SelectorError(`Invalid CSS selector: "${selector}". ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Error if no matches found
  if (matchingElements.length === 0) {
    throw new SelectorError(`No elements match selector: "${selector}"`);
  }
  
  // Build accessibility tree for each matching element
  const results: TreeBuildResult[] = [];
  for (const element of matchingElements) {
    const result = buildAccessibilityTree(element, sourceHash);
    results.push(result);
  }
  
  return results;
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
