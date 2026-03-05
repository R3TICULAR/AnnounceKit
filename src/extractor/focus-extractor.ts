/**
 * Focus information extraction.
 * 
 * Determines focusability and tabindex for elements.
 */

import type { FocusInfo } from '../model/types.js';

/**
 * Natively focusable element types.
 */
const NATIVELY_FOCUSABLE_ELEMENTS = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'area',
  'iframe',
  'object',
  'embed',
  'audio',
  'video',
];

/**
 * Extracts focus information from an element.
 * 
 * Determines if an element is focusable and extracts explicit tabindex.
 * 
 * @param element - Element to extract focus info from
 * @returns Focus information
 */
export function extractFocusInfo(element: Element): FocusInfo {
  const tabindexAttr = element.getAttribute('tabindex');
  const tabindex = tabindexAttr !== null ? parseInt(tabindexAttr, 10) : undefined;

  // Determine focusability
  const focusable = isFocusable(element, tabindex);

  // Only include tabindex if explicitly set
  return {
    focusable,
    ...(tabindexAttr !== null && !isNaN(tabindex!) && { tabindex }),
  };
}

/**
 * Determines if an element is focusable.
 * 
 * An element is focusable if:
 * - It's a natively focusable element (and not disabled)
 * - It has tabindex >= 0
 * - It has tabindex = -1 (programmatically focusable)
 * 
 * @param element - Element to check
 * @param tabindex - Parsed tabindex value
 * @returns true if element is focusable
 */
function isFocusable(element: Element, tabindex: number | undefined): boolean {
  const tagName = element.tagName.toLowerCase();

  // Check if element is disabled
  if (isDisabled(element)) {
    return false;
  }

  // Explicit tabindex makes element focusable (including -1 for programmatic focus)
  if (tabindex !== undefined && !isNaN(tabindex)) {
    return true;
  }

  // Check if natively focusable
  if (isNativelyFocusable(element, tagName)) {
    return true;
  }

  // Elements with explicit ARIA roles may be focusable
  // For now, we'll be conservative and only mark as focusable if tabindex is set
  return false;
}

/**
 * Checks if an element is natively focusable.
 * 
 * @param element - Element to check
 * @param tagName - Tag name (lowercase)
 * @returns true if natively focusable
 */
function isNativelyFocusable(element: Element, tagName: string): boolean {
  // Links must have href to be focusable
  if (tagName === 'a' || tagName === 'area') {
    return element.hasAttribute('href');
  }

  // Check if in the list of natively focusable elements
  if (NATIVELY_FOCUSABLE_ELEMENTS.includes(tagName)) {
    return true;
  }

  return false;
}

/**
 * Checks if an element is disabled.
 * 
 * @param element - Element to check
 * @returns true if disabled
 */
function isDisabled(element: Element): boolean {
  // Check native disabled attribute
  if ('disabled' in element) {
    const htmlElement = element as HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement;
    if (htmlElement.disabled) {
      return true;
    }
  }

  // Check aria-disabled
  const ariaDisabled = element.getAttribute('aria-disabled');
  if (ariaDisabled === 'true') {
    return true;
  }

  return false;
}
