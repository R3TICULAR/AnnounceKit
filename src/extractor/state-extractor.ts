/**
 * State and property extraction from ARIA attributes.
 * 
 * Extracts accessibility states and properties from elements.
 */

import type { AccessibleState, AccessibleValue } from '../model/types.js';

/**
 * Warning emitted during state extraction.
 */
export interface StateExtractionWarning {
  message: string;
  element: Element;
}

/**
 * Result of state extraction.
 */
export interface StateExtractionResult {
  state: AccessibleState;
  warnings: StateExtractionWarning[];
}

/**
 * Result of value extraction.
 */
export interface ValueExtractionResult {
  value: AccessibleValue | undefined;
  warnings: StateExtractionWarning[];
}

/**
 * Extracts accessibility state from an element.
 * 
 * Extracts ARIA state attributes and native element states.
 * 
 * @param element - Element to extract state from
 * @returns Extracted state and warnings
 */
export function extractState(element: Element): StateExtractionResult {
  const warnings: StateExtractionWarning[] = [];
  const state: AccessibleState = {};

  // aria-expanded
  const expanded = extractBooleanAttribute(element, 'aria-expanded', warnings);
  if (expanded !== undefined) {
    state.expanded = expanded;
  }

  // aria-checked (boolean or 'mixed')
  const checked = extractTriStateAttribute(element, 'aria-checked', warnings);
  if (checked !== undefined) {
    state.checked = checked;
  }

  // aria-pressed (boolean or 'mixed')
  const pressed = extractTriStateAttribute(element, 'aria-pressed', warnings);
  if (pressed !== undefined) {
    state.pressed = pressed;
  }

  // aria-selected
  const selected = extractBooleanAttribute(element, 'aria-selected', warnings);
  if (selected !== undefined) {
    state.selected = selected;
  }

  // aria-disabled
  const disabled = extractBooleanAttribute(element, 'aria-disabled', warnings);
  if (disabled !== undefined) {
    state.disabled = disabled;
  }

  // aria-invalid
  const invalid = extractBooleanAttribute(element, 'aria-invalid', warnings);
  if (invalid !== undefined) {
    state.invalid = invalid;
  }

  // aria-required
  const required = extractBooleanAttribute(element, 'aria-required', warnings);
  if (required !== undefined) {
    state.required = required;
  }

  // aria-readonly
  const readonly = extractBooleanAttribute(element, 'aria-readonly', warnings);
  if (readonly !== undefined) {
    state.readonly = readonly;
  }

  // aria-busy
  const busy = extractBooleanAttribute(element, 'aria-busy', warnings);
  if (busy !== undefined) {
    state.busy = busy;
  }

  // aria-current
  const current = extractCurrentAttribute(element, warnings);
  if (current !== undefined) {
    state.current = current;
  }

  // aria-grabbed
  const grabbed = extractBooleanAttribute(element, 'aria-grabbed', warnings);
  if (grabbed !== undefined) {
    state.grabbed = grabbed;
  }

  // aria-hidden
  const hidden = extractBooleanAttribute(element, 'aria-hidden', warnings);
  if (hidden !== undefined) {
    state.hidden = hidden;
  }

  // aria-level (for headings)
  const level = extractLevelAttribute(element, warnings);
  if (level !== undefined) {
    state.level = level;
  }

  // aria-posinset and aria-setsize (for lists, tabs, etc.)
  const posinset = extractNumberAttribute(element, 'aria-posinset', warnings);
  if (posinset !== undefined) {
    state.posinset = posinset;
  }

  const setsize = extractNumberAttribute(element, 'aria-setsize', warnings);
  if (setsize !== undefined) {
    state.setsize = setsize;
  }

  // Extract native element states
  extractNativeStates(element, state, warnings);

  return { state, warnings };
}

/**
 * Extracts value information from form controls.
 * 
 * @param element - Element to extract value from
 * @returns Extracted value and warnings
 */
export function extractValue(element: Element): ValueExtractionResult {
  const warnings: StateExtractionWarning[] = [];

  // Only extract value for form controls
  const tagName = element.tagName.toLowerCase();
  
  if (tagName === 'input') {
    return extractInputValue(element as HTMLInputElement, warnings);
  }

  if (tagName === 'textarea') {
    return extractTextareaValue(element as HTMLTextAreaElement, warnings);
  }

  if (tagName === 'select') {
    return extractSelectValue(element as HTMLSelectElement, warnings);
  }

  // Check for aria-valuenow (for range widgets)
  const valueNow = element.getAttribute('aria-valuenow');
  if (valueNow !== null) {
    const current = parseFloat(valueNow);
    if (!isNaN(current)) {
      const valueMin = element.getAttribute('aria-valuemin');
      const valueMax = element.getAttribute('aria-valuemax');
      const valueText = element.getAttribute('aria-valuetext');

      return {
        value: {
          current,
          min: valueMin !== null ? parseFloat(valueMin) : undefined,
          max: valueMax !== null ? parseFloat(valueMax) : undefined,
          text: valueText || undefined,
        },
        warnings,
      };
    }
  }

  return { value: undefined, warnings };
}

/**
 * Extracts boolean ARIA attribute.
 * 
 * @param element - Element to extract from
 * @param attrName - Attribute name
 * @param warnings - Array to collect warnings
 * @returns Boolean value or undefined
 */
function extractBooleanAttribute(
  element: Element,
  attrName: string,
  warnings: StateExtractionWarning[]
): boolean | undefined {
  const value = element.getAttribute(attrName);
  if (value === null) {
    return undefined;
  }

  const normalized = value.toLowerCase().trim();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }

  warnings.push({
    message: `Invalid ${attrName} value: "${value}". Expected "true" or "false".`,
    element,
  });
  return undefined;
}

/**
 * Extracts tri-state ARIA attribute (boolean or 'mixed').
 * 
 * @param element - Element to extract from
 * @param attrName - Attribute name
 * @param warnings - Array to collect warnings
 * @returns Boolean, 'mixed', or undefined
 */
function extractTriStateAttribute(
  element: Element,
  attrName: string,
  warnings: StateExtractionWarning[]
): boolean | 'mixed' | undefined {
  const value = element.getAttribute(attrName);
  if (value === null) {
    return undefined;
  }

  const normalized = value.toLowerCase().trim();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  if (normalized === 'mixed') {
    return 'mixed';
  }

  warnings.push({
    message: `Invalid ${attrName} value: "${value}". Expected "true", "false", or "mixed".`,
    element,
  });
  return undefined;
}

/**
 * Extracts aria-current attribute.
 * 
 * @param element - Element to extract from
 * @param warnings - Array to collect warnings
 * @returns Current value or undefined
 */
function extractCurrentAttribute(
  element: Element,
  warnings: StateExtractionWarning[]
): 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | false | undefined {
  const value = element.getAttribute('aria-current');
  if (value === null) {
    return undefined;
  }

  const normalized = value.toLowerCase().trim();
  const validValues = ['page', 'step', 'location', 'date', 'time', 'true', 'false'];

  if (validValues.includes(normalized)) {
    return normalized === 'false' ? false : (normalized as any);
  }

  warnings.push({
    message: `Invalid aria-current value: "${value}". Expected one of: ${validValues.join(', ')}.`,
    element,
  });
  return undefined;
}

/**
 * Extracts aria-level attribute for headings.
 * 
 * @param element - Element to extract from
 * @param warnings - Array to collect warnings
 * @returns Level (1-6) or undefined
 */
function extractLevelAttribute(
  element: Element,
  warnings: StateExtractionWarning[]
): number | undefined {
  // Check aria-level attribute
  const ariaLevel = element.getAttribute('aria-level');
  if (ariaLevel !== null) {
    const level = parseInt(ariaLevel, 10);
    if (!isNaN(level) && level >= 1 && level <= 6) {
      return level;
    }
    warnings.push({
      message: `Invalid aria-level value: "${ariaLevel}". Expected integer 1-6.`,
      element,
    });
    return undefined;
  }

  // Check native heading level
  const tagName = element.tagName.toLowerCase();
  const match = tagName.match(/^h([1-6])$/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return undefined;
}

/**
 * Extracts numeric ARIA attribute.
 * 
 * @param element - Element to extract from
 * @param attrName - Attribute name
 * @param warnings - Array to collect warnings
 * @returns Number or undefined
 */
function extractNumberAttribute(
  element: Element,
  attrName: string,
  warnings: StateExtractionWarning[]
): number | undefined {
  const value = element.getAttribute(attrName);
  if (value === null) {
    return undefined;
  }

  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1) {
    warnings.push({
      message: `Invalid ${attrName} value: "${value}". Expected positive integer.`,
      element,
    });
    return undefined;
  }

  return num;
}

/**
 * Extracts native element states (checked, disabled, etc.).
 * 
 * @param element - Element to extract from
 * @param state - State object to populate
 * @param warnings - Array to collect warnings
 */
function extractNativeStates(
  element: Element,
  state: AccessibleState,
  warnings: StateExtractionWarning[]
): void {
  const tagName = element.tagName.toLowerCase();

  // Native checked state for checkboxes and radios
  if (tagName === 'input') {
    const input = element as HTMLInputElement;
    const type = input.type.toLowerCase();

    if (type === 'checkbox' || type === 'radio') {
      // Only set if not already set by aria-checked
      if (state.checked === undefined) {
        state.checked = input.checked;
      }
    }
  }

  // Native disabled state
  if ('disabled' in element) {
    const htmlElement = element as HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement;
    // Only set if not already set by aria-disabled
    if (state.disabled === undefined && htmlElement.disabled) {
      state.disabled = true;
    }
  }

  // Native required state
  if ('required' in element) {
    const htmlElement = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    // Only set if not already set by aria-required
    if (state.required === undefined && htmlElement.required) {
      state.required = true;
    }
  }

  // Native readonly state
  if ('readOnly' in element) {
    const htmlElement = element as HTMLInputElement | HTMLTextAreaElement;
    // Only set if not already set by aria-readonly
    if (state.readonly === undefined && htmlElement.readOnly) {
      state.readonly = true;
    }
  }
}

/**
 * Extracts value from input element.
 */
function extractInputValue(
  input: HTMLInputElement,
  warnings: StateExtractionWarning[]
): ValueExtractionResult {
  const type = input.type.toLowerCase();

  // Checkbox and radio use checked state, not value
  if (type === 'checkbox' || type === 'radio') {
    return { value: undefined, warnings };
  }

  // Button types don't have meaningful values
  if (type === 'button' || type === 'submit' || type === 'reset') {
    return { value: undefined, warnings };
  }

  // Text-like inputs
  const value = input.value;
  if (value) {
    return {
      value: {
        current: value,
        text: value,
      },
      warnings,
    };
  }

  return { value: undefined, warnings };
}

/**
 * Extracts value from textarea element.
 */
function extractTextareaValue(
  textarea: HTMLTextAreaElement,
  warnings: StateExtractionWarning[]
): ValueExtractionResult {
  const value = textarea.value;
  if (value) {
    return {
      value: {
        current: value,
        text: value,
      },
      warnings,
    };
  }

  return { value: undefined, warnings };
}

/**
 * Extracts value from select element.
 */
function extractSelectValue(
  select: HTMLSelectElement,
  warnings: StateExtractionWarning[]
): ValueExtractionResult {
  const value = select.value;
  const selectedOption = select.options[select.selectedIndex];
  const text = selectedOption?.textContent || value;

  if (value) {
    return {
      value: {
        current: value,
        text,
      },
      warnings,
    };
  }

  return { value: undefined, warnings };
}
