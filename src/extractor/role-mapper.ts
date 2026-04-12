/**
 * Role computation and mapping.
 * 
 * Maps HTML elements to their implicit ARIA roles and validates explicit roles.
 */

import type { AccessibleRole } from '../model/types.js';
import { SUPPORTED_ROLES } from '../model/types.js';

/**
 * Warning emitted during role computation.
 */
export interface RoleComputationWarning {
  message: string;
  element: Element;
}

/**
 * Result of role computation.
 */
export interface RoleComputationResult {
  role: AccessibleRole | null;
  warnings: RoleComputationWarning[];
}

/**
 * Mapping of HTML elements to their implicit ARIA roles.
 */
const IMPLICIT_ROLE_MAP: Record<string, AccessibleRole> = {
  // Interactive elements
  'button': 'button',
  'a': 'link', // Only if href attribute present
  
  // Form controls
  'input': 'textbox', // Default, varies by type
  'textarea': 'textbox',
  'select': 'listbox',
  
  // Headings
  'h1': 'heading',
  'h2': 'heading',
  'h3': 'heading',
  'h4': 'heading',
  'h5': 'heading',
  'h6': 'heading',
  
  // Landmarks
  'nav': 'navigation',
  'main': 'main',
  'header': 'banner', // Only if not nested in article/section
  'footer': 'contentinfo', // Only if not nested in article/section
  'aside': 'complementary',
  'form': 'form',
  'section': 'region', // Only if has accessible name
  
  // Lists
  'ul': 'list',
  'ol': 'list',
  'li': 'listitem',
  
  // Images
  'img': 'img',
  
  // Articles
  'article': 'article',

  // Static content (new)
  'p': 'paragraph',
  'blockquote': 'blockquote',
  'code': 'code',
  'pre': 'code',

  // Tables (new)
  'table': 'table',
  'tr': 'row',
  'td': 'cell',
  'th': 'columnheader', // Default; scope="row" handled in computeImplicitRole

  // Definition lists (new)
  'dl': 'list',
  'dt': 'term',
  'dd': 'definition',

  // Figures (new)
  'figure': 'figure',
  'figcaption': 'caption',

  // Disclosure (new)
  'details': 'group',
  'summary': 'button',

  // Dialogs and widgets (new)
  'dialog': 'dialog',
  'meter': 'meter',
  'progress': 'progressbar',
  'output': 'status',

  // Forms (new)
  'fieldset': 'group',
  'legend': 'caption',

  // Embedded content (new)
  'iframe': 'document',
  'video': 'application',
  'audio': 'application',

  // Separators (new)
  'hr': 'separator',

  // Table caption (new)
  'caption': 'caption',
};

/**
 * Input type to role mapping.
 */
const INPUT_TYPE_ROLE_MAP: Record<string, AccessibleRole> = {
  'button': 'button',
  'submit': 'button',
  'reset': 'button',
  'checkbox': 'checkbox',
  'radio': 'radio',
  'text': 'textbox',
  'email': 'textbox',
  'password': 'textbox',
  'search': 'textbox',
  'tel': 'textbox',
  'url': 'textbox',
  'number': 'textbox',
};

/**
 * Computes the accessible role for an element.
 * 
 * Priority:
 * 1. Explicit role attribute (if valid)
 * 2. Implicit role based on element type
 * 3. null if no role
 * 
 * @param element - Element to compute role for
 * @returns Computed role and warnings
 */
export function computeRole(element: Element): RoleComputationResult {
  const warnings: RoleComputationWarning[] = [];
  
  // 1. Check for explicit role attribute
  const explicitRole = element.getAttribute('role');
  if (explicitRole) {
    const role = validateAndNormalizeRole(explicitRole, element, warnings);
    if (role) {
      return { role, warnings };
    }
    // If explicit role is invalid, fall through to implicit role
  }
  
  // 2. Compute implicit role
  const implicitRole = computeImplicitRole(element, warnings);
  return { role: implicitRole, warnings };
}

/**
 * Validates and normalizes an explicit role attribute.
 * 
 * @param roleAttr - Role attribute value
 * @param element - Element with the role
 * @param warnings - Array to collect warnings
 * @returns Validated role or null if invalid
 */
function validateAndNormalizeRole(
  roleAttr: string,
  element: Element,
  warnings: RoleComputationWarning[]
): AccessibleRole | null {
  const role = roleAttr.trim().toLowerCase();
  
  // Check for presentation/none roles (elements should be hidden from a11y tree)
  if (role === 'presentation' || role === 'none') {
    return null;
  }
  
  // Validate against supported roles
  if (SUPPORTED_ROLES.includes(role as AccessibleRole)) {
    return role as AccessibleRole;
  }
  
  // Invalid or unsupported role
  warnings.push({
    message: `Invalid or unsupported role: "${roleAttr}". Falling back to implicit role.`,
    element,
  });
  
  return null;
}

/**
 * Computes the implicit ARIA role for an element.
 * 
 * @param element - Element to compute implicit role for
 * @param warnings - Array to collect warnings
 * @returns Implicit role or null
 */
function computeImplicitRole(
  element: Element,
  _warnings: RoleComputationWarning[]
): AccessibleRole | null {
  const tagName = element.tagName.toLowerCase();
  
  // Special case: input elements vary by type
  if (tagName === 'input') {
    return computeInputRole(element as HTMLInputElement);
  }
  
  // Special case: links only have link role if href present
  if (tagName === 'a') {
    return element.hasAttribute('href') ? 'link' : null;
  }
  
  // Special case: header/footer only landmarks if not nested
  if (tagName === 'header') {
    return isTopLevelLandmark(element) ? 'banner' : null;
  }
  
  if (tagName === 'footer') {
    return isTopLevelLandmark(element) ? 'contentinfo' : null;
  }
  
  // Special case: th elements — scope="row" maps to rowheader
  if (tagName === 'th') {
    const scope = element.getAttribute('scope');
    return scope === 'row' ? 'rowheader' : 'columnheader';
  }

  // Special case: section only has region role if it has accessible name
  if (tagName === 'section') {
    // For now, we'll return 'region' - the caller should check if it has a name
    // In a full implementation, we'd check for aria-label or aria-labelledby
    return element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')
      ? 'region'
      : null;
  }
  
  // Look up in implicit role map
  const implicitRole = IMPLICIT_ROLE_MAP[tagName];
  return implicitRole || null;
}

/**
 * Computes the role for an input element based on its type.
 * 
 * @param input - Input element
 * @returns Role for the input
 */
function computeInputRole(input: HTMLInputElement): AccessibleRole {
  const type = (input.getAttribute('type') || 'text').toLowerCase();
  return INPUT_TYPE_ROLE_MAP[type] || 'textbox';
}

/**
 * Checks if header/footer is a top-level landmark.
 * 
 * Header and footer only have landmark roles (banner/contentinfo) when they
 * are not nested inside article or section elements.
 * 
 * @param element - Header or footer element
 * @returns true if top-level landmark
 */
function isTopLevelLandmark(element: Element): boolean {
  let parent = element.parentElement;
  
  while (parent) {
    const tagName = parent.tagName.toLowerCase();
    if (tagName === 'article' || tagName === 'section') {
      return false;
    }
    parent = parent.parentElement;
  }
  
  return true;
}

/**
 * Checks if an element should be included in the accessibility tree.
 * 
 * Elements are excluded if:
 * - They have role="presentation" or role="none"
 * - They have aria-hidden="true"
 * - They have no accessible role
 * 
 * @param element - Element to check
 * @returns true if element should be included
 */
export function isAccessible(element: Element): boolean {
  // Check aria-hidden
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  
  // Check for presentation/none role
  const role = element.getAttribute('role');
  if (role === 'presentation' || role === 'none') {
    return false;
  }
  
  // Element is accessible if it has a role (explicit or implicit)
  const roleResult = computeRole(element);
  return roleResult.role !== null;
}
