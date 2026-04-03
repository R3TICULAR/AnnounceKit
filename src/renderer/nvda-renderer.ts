/**
 * NVDA screen reader announcement renderer.
 * 
 * Generates heuristic announcement text approximating NVDA output.
 * This is NOT a perfect emulation - real NVDA behavior varies by version,
 * settings, and context. Use for development guidance only.
 */

import type { AccessibleNode, AccessibleRole, AnnouncementModel } from '../model/types.js';

/**
 * Renders an announcement model as NVDA-style announcement text.
 * 
 * @param model - Announcement model to render
 * @returns NVDA-style announcement text
 */
export function renderNVDA(model: AnnouncementModel): string {
  const announcements: string[] = [];
  renderNodeNVDA(model.root, announcements);
  return announcements.join('\n');
}

/**
 * Recursively renders a node and its children as NVDA announcements.
 * 
 * @param node - Node to render
 * @param announcements - Array to collect announcement strings
 */
function renderNodeNVDA(node: AccessibleNode, announcements: string[]): void {
  const announcement = formatNodeNVDA(node);
  if (announcement) {
    announcements.push(announcement);
  }
  
  // Recursively render children
  for (const child of node.children) {
    renderNodeNVDA(child, announcements);
  }
}

/**
 * Formats a single node as an NVDA announcement.
 * 
 * @param node - Node to format
 * @returns Formatted announcement string or empty string if node should not be announced
 */
function formatNodeNVDA(node: AccessibleNode): string {
  const parts: string[] = [];
  
  // Add name (if present)
  if (node.name) {
    parts.push(node.name);
  }
  
  // Add role-specific formatting
  const roleText = formatRoleNVDA(node);
  if (roleText) {
    parts.push(roleText);
  }
  
  // Add states
  const stateText = formatStatesNVDA(node);
  if (stateText) {
    parts.push(stateText);
  }
  
  // Add value (for form controls)
  if (node.value) {
    const valueText = node.value.text || String(node.value.current);
    if (valueText) {
      parts.push(valueText);
    }
  }
  
  // Add description (if present)
  if (node.description) {
    parts.push(node.description);
  }
  
  return parts.join(', ');
}

/**
 * Formats the role portion of an NVDA announcement.
 * 
 * @param node - Node to format
 * @returns Role text or empty string
 */
function formatRoleNVDA(node: AccessibleNode): string {
  const role = node.role;
  
  switch (role) {
    case 'button':
      return 'button';
    
    case 'link':
      return 'link';
    
    case 'heading':
      if (node.state.level) {
        return `heading level ${node.state.level}`;
      }
      return 'heading';
    
    case 'textbox':
      return 'edit';
    
    case 'checkbox':
      return 'checkbox';
    
    case 'radio':
      return 'radio button';
    
    case 'combobox':
      return 'combo box';
    
    case 'listbox':
      return 'list box';
    
    case 'option':
      return 'option';
    
    case 'list':
      return 'list';
    
    case 'listitem':
      return 'list item';
    
    case 'navigation':
      return 'navigation landmark';
    
    case 'main':
      return 'main landmark';
    
    case 'banner':
      return 'banner landmark';
    
    case 'contentinfo':
      return 'content information landmark';
    
    case 'region':
      return 'region landmark';
    
    case 'complementary':
      return 'complementary landmark';
    
    case 'form':
      return 'form landmark';
    
    case 'search':
      return 'search landmark';
    
    case 'img':
      return 'graphic';
    
    case 'article':
      return 'article';
    
    case 'generic':
      // Generic containers are typically not announced
      return '';
    
    default:
      return role;
  }
}

/**
 * Formats the state portion of an NVDA announcement.
 * 
 * @param node - Node to format
 * @returns State text or empty string
 */
function formatStatesNVDA(node: AccessibleNode): string {
  const states: string[] = [];
  
  // Expanded/collapsed state
  if (node.state.expanded !== undefined) {
    states.push(node.state.expanded ? 'expanded' : 'collapsed');
  }
  
  // Checked state (checkbox/radio)
  if (node.state.checked !== undefined) {
    if (node.state.checked === 'mixed') {
      states.push('half checked');
    } else {
      states.push(node.state.checked ? 'checked' : 'not checked');
    }
  }
  
  // Pressed state (toggle button)
  if (node.state.pressed !== undefined) {
    if (node.state.pressed === 'mixed') {
      states.push('half pressed');
    } else {
      states.push(node.state.pressed ? 'pressed' : 'not pressed');
    }
  }
  
  // Selected state
  if (node.state.selected !== undefined) {
    states.push(node.state.selected ? 'selected' : 'not selected');
  }
  
  // Disabled state
  if (node.state.disabled) {
    states.push('unavailable');
  }
  
  // Invalid state
  if (node.state.invalid) {
    states.push('invalid entry');
  }
  
  // Required state
  if (node.state.required) {
    states.push('required');
  }
  
  // Read-only state
  if (node.state.readonly) {
    states.push('read only');
  }
  
  // Busy state
  if (node.state.busy) {
    states.push('busy');
  }
  
  // Current state
  if (node.state.current) {
    if (node.state.current === 'page') {
      states.push('current page');
    } else if (node.state.current === 'step') {
      states.push('current step');
    } else if (node.state.current === 'location') {
      states.push('current location');
    } else if (node.state.current === 'date') {
      states.push('current date');
    } else if (node.state.current === 'time') {
      states.push('current time');
    } else if (node.state.current === 'true') {
      states.push('current');
    }
  }
  
  // Grabbed state (drag and drop)
  if (node.state.grabbed !== undefined) {
    states.push(node.state.grabbed ? 'grabbed' : 'not grabbed');
  }
  
  return states.join(', ');
}
