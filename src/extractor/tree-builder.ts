/**
 * Accessibility tree builder.
 * 
 * Builds the complete accessibility tree from a DOM tree by integrating
 * all extraction components (role, name, description, state, value, focus).
 * 
 * Supports transparent traversal through role-less elements, text node
 * capture as staticText nodes, shadow DOM traversal, and CSS hidden state.
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
 * Checks whether an element is hidden from the accessibility tree.
 * 
 * Checks aria-hidden="true", display: none, and visibility: hidden.
 * Gracefully skips CSS checks when getComputedStyle is unavailable.
 * 
 * @param element - Element to check
 * @returns true if the element is hidden
 */
function isHidden(element: Element): boolean {
  // Check aria-hidden on element itself
  if (element.getAttribute('aria-hidden') === 'true') return true;

  // Check CSS hidden state if getComputedStyle is available
  if (typeof getComputedStyle === 'function') {
    try {
      const style = getComputedStyle(element);
      if (style.display === 'none') return true;
      if (style.visibility === 'hidden') return true;
    } catch {
      // Environment doesn't support getComputedStyle — skip CSS checks
    }
  }

  return false;
}

/**
 * Processes a single child node (Text or Element) and appends resulting
 * AccessibleNodes to the children array.
 * 
 * For Text nodes: creates a staticText AccessibleNode with trimmed text.
 * For Element nodes: checks hidden/accessible state; if role-less, does
 * transparent traversal via collectChildrenFromRolelessElement.
 * 
 * @param node - DOM node to process
 * @param children - Array to append resulting AccessibleNodes to
 * @param warnings - Array to collect warnings
 */
function processChildNode(
  node: Node,
  children: AccessibleNode[],
  warnings: TreeBuildWarning[]
): void {
  if (node.nodeType === 3) { // TEXT_NODE
    const text = (node.textContent || '').trim();
    if (text.length > 0) {
      children.push({
        role: 'staticText',
        name: text,
        state: {},
        focus: { focusable: false },
        children: [],
      });
    }
    return;
  }
  if (node.nodeType === 1) { // ELEMENT_NODE
    const element = node as Element;
    if (isHidden(element)) return;
    if (!isAccessible(element)) {
      // Transparent traversal: collect children from role-less element
      const grandchildren = collectChildrenFromRolelessElement(element, warnings);
      children.push(...grandchildren);
      return;
    }
    const childNode = buildNodeRecursive(element, warnings);
    if (childNode) children.push(childNode);
  }
}

/**
 * Collects accessible children from a role-less element (transparent traversal).
 * 
 * Traverses shadow DOM first (if present), then light DOM childNodes.
 * Returns a flat array of AccessibleNodes to be merged into the parent's children.
 * 
 * @param element - Role-less element to collect children from
 * @param warnings - Array to collect warnings
 * @returns Flat array of AccessibleNodes
 */
function collectChildrenFromRolelessElement(
  element: Element,
  warnings: TreeBuildWarning[]
): AccessibleNode[] {
  const children: AccessibleNode[] = [];
  // Traverse shadow DOM first if present
  if (element.shadowRoot) {
    for (const child of Array.from(element.shadowRoot.childNodes)) {
      processChildNode(child, children, warnings);
    }
  }
  // Then light DOM
  for (const child of Array.from(element.childNodes)) {
    processChildNode(child, children, warnings);
  }
  return children;
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
  
  // If root element is hidden, return empty generic container
  if (isHidden(rootElement)) {
    const model: AnnouncementModel = {
      version: CURRENT_MODEL_VERSION,
      root: {
        role: 'generic',
        name: '',
        state: {},
        focus: { focusable: false },
        children: [],
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        ...(sourceHash && { sourceHash }),
      },
    };
    return { model, warnings };
  }

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
 * Checks hidden state first, then accessibility. If the element has no role,
 * transparent traversal is not done here (it's handled by processChildNode
 * in the parent's iteration). This function is only called for elements
 * that are known to be accessible.
 * 
 * @param element - DOM element to build node from
 * @param warnings - Array to collect warnings
 * @returns Accessible node or null if element is hidden or not accessible
 */
function buildNodeRecursive(
  element: Element,
  warnings: TreeBuildWarning[]
): AccessibleNode | null {
  // Check hidden state first (before any extraction)
  if (isHidden(element)) {
    return null;
  }

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
  
  // Build children from childNodes (includes Text nodes)
  const children: AccessibleNode[] = [];
  // Shadow DOM first
  if (element.shadowRoot) {
    for (const child of Array.from(element.shadowRoot.childNodes)) {
      processChildNode(child, children, warnings);
    }
  }
  // Light DOM
  for (const child of Array.from(element.childNodes)) {
    processChildNode(child, children, warnings);
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
 * Uses childNodes and processChildNode for text node and transparent traversal support.
 * 
 * @param rootElement - Root DOM element
 * @param warnings - Array to collect warnings
 * @returns Generic container node with accessible children
 */
function createGenericContainer(
  rootElement: Element,
  warnings: TreeBuildWarning[]
): AccessibleNode {
  // Build children from root element using childNodes
  const children: AccessibleNode[] = [];
  // Shadow DOM first
  if (rootElement.shadowRoot) {
    for (const child of Array.from(rootElement.shadowRoot.childNodes)) {
      processChildNode(child, children, warnings);
    }
  }
  // Light DOM
  for (const child of Array.from(rootElement.childNodes)) {
    processChildNode(child, children, warnings);
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
