/**
 * JAWS screen reader announcement renderer.
 * 
 * Generates heuristic announcement text approximating JAWS output.
 * This is NOT a perfect emulation - real JAWS behavior varies by version,
 * settings, verbosity level, and context. Use for development guidance only.
 */

import type { AccessibleNode, AccessibleRole, AnnouncementModel } from '../model/types.js';

/**
 * Renders an announcement model as JAWS-style announcement text.
 * 
 * @param model - Announcement model to render
 * @returns JAWS-style announcement text
 */
export function renderJAWS(model: AnnouncementModel): string {
  const announcements: string[] = [];
  renderNodeJAWS(model.root, announcements);
  return announcements.join('\n');
}

/**
 * Recursively renders a node and its children as JAWS announcements.
 * 
 * @param node - Node to render
 * @param announcements - Array to collect announcement strings
 */
function renderNodeJAWS(node: AccessibleNode, announcements: string[]): void {
  const announcement = formatNodeJAWS(node);
  if (announcement) {
    announcements.push(announcement);
  }
  
  // Recursively render children
  for (const child of node.children) {
    renderNodeJAWS(child, announcements);
  }
}

/**
 * Formats a single node as a JAWS announcement.
 * 
 * @param node - Node to format
 * @returns Formatted announcement string or empty string if node should not be announced
 */
function formatNodeJAWS(node: AccessibleNode): string {
  const parts: string[] = [];
  
  // Add name (if present)
  if (node.name) {
    parts.push(node.name);
  }
  
  // Add role-specific formatting
  const roleText = formatRoleJAWS(node);
  if (roleText) {
    parts.push(roleText);
  }
  
  // Add states
  const stateText = formatStatesJAWS(node);
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
 * Formats the role portion of a JAWS announcement.
 * 
 * @param node - Node to format
 * @returns Role text or empty string
 */
function formatRoleJAWS(node: AccessibleNode): string {
  const role = node.role;
  
  switch (role) {
    case 'button':
      return 'button';
    
    case 'link':
      // JAWS uses "clickable" for links
      return 'clickable';
    
    case 'heading':
      if (node.state.level) {
        return `heading ${node.state.level}`;
      }
      return 'heading';
    
    case 'textbox':
      return 'edit';
    
    case 'checkbox':
      return 'check box';
    
    case 'radio':
      return 'radio button';
    
    case 'combobox':
      // JAWS uses "combo box" (two words)
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
      return 'navigation region';
    
    case 'main':
      return 'main region';
    
    case 'banner':
      return 'banner region';
    
    case 'contentinfo':
      return 'content information region';
    
    case 'region':
      return 'region';
    
    case 'img':
      return 'graphic';
    
    case 'article':
      return 'article';
    
    case 'complementary':
      return 'complementary region';
    
    case 'form':
      return 'form';
    
    case 'search':
      return 'search region';
    
    case 'generic':
      // Generic containers typically not announced
      return '';
    
    case 'staticText':
    case 'paragraph':
    case 'term':
    case 'definition':
    case 'caption':
      return '';
    
    case 'blockquote':
      return 'block quote';
    
    case 'code':
      return 'code';
    
    case 'table': {
      const rows = node.children.filter(c => c.role === 'row');
      const rowCount = rows.length;
      const colCount = rows.length > 0 ? rows[0].children.length : 0;
      return `table with ${rowCount} rows and ${colCount} columns`;
    }
    
    case 'row': {
      const pos = node.state.posinset ?? 0;
      return `row ${pos}`;
    }
    
    case 'cell': {
      const pos = node.state.posinset ?? 0;
      return `column ${pos}`;
    }
    
    case 'columnheader':
      return 'column header';
    
    case 'rowheader':
      return 'row header';
    
    case 'figure':
      return 'figure';
    
    case 'dialog':
      return 'dialog';
    
    case 'meter':
      return 'meter';
    
    case 'progressbar':
      return 'progress bar';
    
    case 'status':
      return 'status';
    
    case 'group':
      return node.name ? 'group' : '';
    
    case 'document':
      return 'frame';
    
    case 'application':
      return 'embedded object';
    
    case 'separator':
      return 'separator';
    
    default:
      return role;
  }
}

/**
 * Formats the state portion of a JAWS announcement.
 * 
 * @param node - Node to format
 * @returns State text or empty string
 */
function formatStatesJAWS(node: AccessibleNode): string {
  const states: string[] = [];
  
  // Expanded/collapsed
  if (node.state.expanded !== undefined) {
    states.push(node.state.expanded ? 'expanded' : 'collapsed');
  }
  
  // Checked state (checkbox, radio)
  if (node.state.checked !== undefined) {
    if (node.state.checked === 'mixed') {
      states.push('partially checked');
    } else if (node.state.checked) {
      states.push('checked');
    } else {
      states.push('not checked');
    }
  }
  
  // Pressed state (toggle button)
  if (node.state.pressed !== undefined) {
    if (node.state.pressed === 'mixed') {
      states.push('partially pressed');
    } else if (node.state.pressed) {
      states.push('pressed');
    } else {
      states.push('not pressed');
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
    switch (node.state.current) {
      case 'page':
        states.push('current page');
        break;
      case 'step':
        states.push('current step');
        break;
      case 'location':
        states.push('current location');
        break;
      case 'date':
        states.push('current date');
        break;
      case 'time':
        states.push('current time');
        break;
      case 'true':
        states.push('current');
        break;
    }
  }
  
  // Grabbed state (drag and drop)
  if (node.state.grabbed !== undefined) {
    states.push(node.state.grabbed ? 'grabbed' : 'not grabbed');
  }
  
  return states.join(', ');
}
