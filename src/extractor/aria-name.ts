/**
 * ARIA accessible name computation.
 * 
 * Implements the ARIA name computation algorithm following the W3C specification.
 * https://www.w3.org/TR/accname-1.2/
 */

/**
 * Warning emitted during name computation.
 */
export interface NameComputationWarning {
  message: string;
  element: Element;
}

/**
 * Result of name computation.
 */
export interface NameComputationResult {
  name: string;
  warnings: NameComputationWarning[];
}

/**
 * Result of description computation.
 */
export interface DescriptionComputationResult {
  description: string;
  warnings: NameComputationWarning[];
}

/**
 * Computes the accessible name for an element following ARIA specification.
 * 
 * Priority order:
 * 1. aria-labelledby (references to other elements)
 * 2. aria-label
 * 3. Native label (for form controls)
 * 4. alt attribute (for images)
 * 5. Text content (for elements that support it)
 * 6. title attribute (fallback)
 * 
 * @param element - Element to compute name for
 * @param visited - Set of visited elements (for cycle detection)
 * @returns Computed accessible name and warnings
 */
export function computeAccessibleName(
  element: Element,
  visited: Set<Element> = new Set()
): NameComputationResult {
  const warnings: NameComputationWarning[] = [];

  // Detect circular references
  if (visited.has(element)) {
    warnings.push({
      message: 'Circular reference detected in aria-labelledby chain',
      element,
    });
    return { name: '', warnings };
  }

  visited.add(element);

  // 1. aria-labelledby (highest priority)
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const name = computeNameFromLabelledBy(element, labelledBy, visited, warnings);
    // Always return if aria-labelledby is present, even if name is empty
    return { name, warnings };
  }

  // 2. aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) {
    return { name: ariaLabel.trim(), warnings };
  }

  // 3. Native label (for form controls)
  if (isFormControl(element)) {
    const labelName = computeNameFromLabel(element);
    if (labelName) {
      return { name: labelName, warnings };
    }
  }

  // 4. alt attribute (for images)
  if (element.tagName.toLowerCase() === 'img') {
    const alt = element.getAttribute('alt');
    if (alt !== null) {
      return { name: alt.trim(), warnings };
    }
  }

  // 5. Text content (for elements that support it)
  if (supportsNameFromContent(element)) {
    const textName = computeNameFromContent(element, visited);
    if (textName) {
      return { name: textName, warnings };
    }
  }

  // 6. title attribute (fallback)
  const title = element.getAttribute('title');
  if (title && title.trim()) {
    return { name: title.trim(), warnings };
  }

  // No name found
  return { name: '', warnings };
}

/**
 * Computes name from aria-labelledby attribute.
 * 
 * @param element - Element with aria-labelledby
 * @param labelledBy - Space-separated list of IDs
 * @param visited - Set of visited elements
 * @param warnings - Array to collect warnings
 * @returns Computed name or empty string
 */
function computeNameFromLabelledBy(
  element: Element,
  labelledBy: string,
  visited: Set<Element>,
  warnings: NameComputationWarning[]
): string {
  const document = element.ownerDocument;
  if (!document) {
    return '';
  }

  const ids = labelledBy.trim().split(/\s+/);
  const names: string[] = [];

  for (const id of ids) {
    if (!id) continue;

    const referencedElement = document.getElementById(id);
    if (!referencedElement) {
      warnings.push({
        message: `aria-labelledby references non-existent ID: ${id}`,
        element,
      });
      continue;
    }

    // Recursively compute name for referenced element
    // For labelledby, we want the text content of the referenced element
    const result = computeAccessibleName(referencedElement, new Set(visited));
    warnings.push(...result.warnings);
    
    // If no name was computed, fall back to text content
    const name = result.name || getTextContent(referencedElement);
    if (name) {
      names.push(name);
    }
  }

  return names.join(' ').trim();
}

/**
 * Computes name from associated label element.
 * 
 * @param element - Form control element
 * @returns Name from label or empty string
 */
function computeNameFromLabel(element: Element): string {
  const document = element.ownerDocument;
  if (!document) {
    return '';
  }

  // Check for explicit label association via id
  const id = element.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) {
      return getTextContent(label);
    }
  }

  // Check for implicit label (element inside label)
  const parentLabel = element.closest('label');
  if (parentLabel) {
    return getTextContent(parentLabel);
  }

  return '';
}

/**
 * Computes name from element's text content.
 * 
 * @param element - Element to get text from
 * @param visited - Set of visited elements
 * @returns Text content or empty string
 */
function computeNameFromContent(element: Element, _visited: Set<Element>): string {
  return getTextContent(element);
}

/**
 * Gets text content from an element, excluding hidden elements.
 * 
 * @param element - Element to get text from
 * @returns Trimmed text content
 */
function getTextContent(element: Element): string {
  // Skip hidden elements
  if (element.getAttribute('aria-hidden') === 'true') {
    return '';
  }

  let text = '';

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === 3) { // TEXT_NODE
      text += node.textContent || '';
    } else if (node.nodeType === 1) { // ELEMENT_NODE
      const childElement = node as Element;
      
      // Skip hidden children
      if (childElement.getAttribute('aria-hidden') === 'true') {
        continue;
      }

      text += getTextContent(childElement);
    }
  }

  return text.trim();
}

/**
 * Checks if element is a form control.
 * 
 * @param element - Element to check
 * @returns true if element is a form control
 */
function isFormControl(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    tagName === 'button'
  );
}

/**
 * Checks if element supports name from content.
 * 
 * Elements like buttons, links, and headings get their name from text content.
 * Form inputs do not.
 * 
 * @param element - Element to check
 * @returns true if element supports name from content
 */
function supportsNameFromContent(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');

  // Elements that support name from content
  const contentElements = [
    'button',
    'a',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'summary',
    'figcaption',
    'legend',
    'caption',
    'th',
    'td',
    'li',
    'dt',
    'dd',
  ];

  if (contentElements.includes(tagName)) {
    return true;
  }

  // Roles that support name from content
  const contentRoles = [
    'button',
    'link',
    'heading',
    'tab',
    'treeitem',
    'option',
    'row',
    'cell',
    'columnheader',
    'rowheader',
    'tooltip',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
  ];

  if (role && contentRoles.includes(role)) {
    return true;
  }

  return false;
}


/**
 * Computes the accessible description for an element.
 * 
 * Priority order:
 * 1. aria-describedby (references to other elements)
 * 2. title attribute (fallback)
 * 
 * @param element - Element to compute description for
 * @returns Computed accessible description and warnings
 */
export function computeAccessibleDescription(
  element: Element
): DescriptionComputationResult {
  const warnings: NameComputationWarning[] = [];

  // 1. aria-describedby (highest priority)
  const describedBy = element.getAttribute('aria-describedby');
  if (describedBy) {
    const description = computeDescriptionFromDescribedBy(
      element,
      describedBy,
      warnings
    );
    if (description) {
      return { description, warnings };
    }
  }

  // 2. title attribute (fallback)
  const title = element.getAttribute('title');
  if (title && title.trim()) {
    return { description: title.trim(), warnings };
  }

  // No description found
  return { description: '', warnings };
}

/**
 * Computes description from aria-describedby attribute.
 * 
 * @param element - Element with aria-describedby
 * @param describedBy - Space-separated list of IDs
 * @param warnings - Array to collect warnings
 * @returns Computed description or empty string
 */
function computeDescriptionFromDescribedBy(
  element: Element,
  describedBy: string,
  warnings: NameComputationWarning[]
): string {
  const document = element.ownerDocument;
  if (!document) {
    return '';
  }

  const ids = describedBy.trim().split(/\s+/);
  const descriptions: string[] = [];

  for (const id of ids) {
    if (!id) continue;

    const referencedElement = document.getElementById(id);
    if (!referencedElement) {
      warnings.push({
        message: `aria-describedby references non-existent ID: ${id}`,
        element,
      });
      continue;
    }

    // Get text content from referenced element
    const text = getTextContent(referencedElement);
    if (text) {
      descriptions.push(text);
    }
  }

  return descriptions.join(' ').trim();
}
