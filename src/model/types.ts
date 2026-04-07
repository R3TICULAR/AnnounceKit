/**
 * Canonical Announcement Model - Version 1
 * 
 * Platform-agnostic representation of accessibility semantics.
 * Deterministic, serializable, suitable for snapshot testing.
 */

/**
 * Model version for forward compatibility.
 * Breaking changes increment major version.
 */
export interface ModelVersion {
  major: number;
  minor: number;
}

/**
 * Accessible role following ARIA specification.
 * V1 supports common interactive and structural roles.
 */
export type AccessibleRole =
  // Interactive elements
  | 'button'
  | 'link'
  | 'heading'
  | 'textbox'
  | 'checkbox'
  | 'radio'
  | 'combobox'
  | 'listbox'
  | 'option'
  // Structural
  | 'list'
  | 'listitem'
  | 'article'
  | 'generic'
  // Landmarks
  | 'navigation'
  | 'main'
  | 'banner'
  | 'contentinfo'
  | 'region'
  | 'img'
  | 'complementary'
  | 'form'
  | 'search'
  // Static content (new)
  | 'paragraph'
  | 'blockquote'
  | 'code'
  | 'staticText'
  // Tables (new)
  | 'table'
  | 'row'
  | 'cell'
  | 'columnheader'
  | 'rowheader'
  // Definition lists (new)
  | 'term'
  | 'definition'
  // Figures (new)
  | 'figure'
  | 'caption'
  // Grouping & disclosure (new)
  | 'group'
  | 'dialog'
  // Widgets (new)
  | 'meter'
  | 'progressbar'
  | 'status'
  // Embedded content (new)
  | 'document'
  | 'application'
  | 'separator';

/**
 * Accessible states and properties.
 * Only includes properties relevant to the element's role.
 */
export interface AccessibleState {
  /** Whether the element is expanded (e.g., accordion, dropdown) */
  expanded?: boolean;
  
  /** Whether the element is checked (checkbox, radio, or mixed state) */
  checked?: boolean | 'mixed';
  
  /** Whether the element is pressed (toggle button) */
  pressed?: boolean | 'mixed';
  
  /** Whether the element is selected (option, tab, etc.) */
  selected?: boolean;
  
  /** Whether the element is disabled */
  disabled?: boolean;
  
  /** Whether the element has invalid input */
  invalid?: boolean;
  
  /** Whether the element is required */
  required?: boolean;
  
  /** Whether the element is read-only */
  readonly?: boolean;
  
  /** Whether the element is busy loading */
  busy?: boolean;
  
  /** Current page/step/location indicator */
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | false;
  
  /** Whether the element is grabbed for drag-and-drop */
  grabbed?: boolean;
  
  /** Whether the element is hidden from accessibility tree */
  hidden?: boolean;
  
  /** Heading level (1-6) */
  level?: number;
  
  /** Position in set (1-indexed) for lists, tabs, etc. */
  posinset?: number;
  
  /** Total size of set */
  setsize?: number;
}

/**
 * Value for form controls and range widgets.
 */
export interface AccessibleValue {
  /** Current value */
  current: string | number;
  
  /** Minimum value (for range widgets) */
  min?: number;
  
  /** Maximum value (for range widgets) */
  max?: number;
  
  /** Textual representation (e.g., "50%") */
  text?: string;
}

/**
 * Focusability information.
 */
export interface FocusInfo {
  /** Whether the element can receive focus */
  focusable: boolean;
  
  /** Explicit tabindex value (only present if explicitly set) */
  tabindex?: number;
}

/**
 * Single node in the accessibility tree.
 */
export interface AccessibleNode {
  /** ARIA role of the element */
  role: AccessibleRole;
  
  /** Accessible name (computed via ARIA name algorithm) */
  name: string;
  
  /** Accessible description (aria-describedby, title, etc.) */
  description?: string;
  
  /** Value for form controls */
  value?: AccessibleValue;
  
  /** State properties */
  state: AccessibleState;
  
  /** Focus information */
  focus: FocusInfo;
  
  /** Child nodes in the accessibility tree */
  children: AccessibleNode[];
}

/**
 * Root of the Canonical Announcement Model.
 */
export interface AnnouncementModel {
  /** Model version for forward compatibility */
  version: ModelVersion;
  
  /** Root node of the accessibility tree */
  root: AccessibleNode;
  
  /** Metadata about the extraction */
  metadata: {
    /** ISO 8601 timestamp of extraction */
    extractedAt: string;
    
    /** Optional hash of source HTML for change detection */
    sourceHash?: string;
  };
}

/**
 * Supported roles as a constant array for validation.
 */
export const SUPPORTED_ROLES: readonly AccessibleRole[] = [
  // Original roles (22)
  'button',
  'link',
  'heading',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'option',
  'list',
  'listitem',
  'navigation',
  'main',
  'banner',
  'contentinfo',
  'region',
  'img',
  'article',
  'complementary',
  'form',
  'search',
  'generic',
  // New roles (21)
  'paragraph',
  'blockquote',
  'code',
  'staticText',
  'table',
  'row',
  'cell',
  'columnheader',
  'rowheader',
  'term',
  'definition',
  'figure',
  'caption',
  'group',
  'dialog',
  'meter',
  'progressbar',
  'status',
  'document',
  'application',
  'separator',
] as const;

/**
 * Current model version constant.
 */
export const CURRENT_MODEL_VERSION: ModelVersion = {
  major: 1,
  minor: 0,
};
