/**
 * VoiceOver screen reader announcement renderer.
 * 
 * Generates heuristic announcement text approximating VoiceOver output.
 * This is NOT a perfect emulation - real VoiceOver behavior varies by version,
 * settings, and context. Use for development guidance only.
 */

import type { AccessibleNode, AccessibleRole, AnnouncementModel } from '../model/types.js';

/**
 * Renders an announcement model as VoiceOver-style announcement text.
 * 
 * @param model - Announcement model to render
 * @returns VoiceOver-style announcement text
 */
export function renderVoiceOver(model: AnnouncementModel): string {
  const announcements: string[] = [];
  renderNodeVoiceOver(model.root, announcements);
  return announcements.join('\n');
}

/**
 * Recursively renders a node and its children as VoiceOver announcements.
 * 
 * @param node - Node to render
 * @param announcements - Array to collect announcement strings
 */
function renderNodeVoiceOver(node: AccessibleNode, announcements: string[]): void {
  const announcement = formatNodeVoiceOver(node);
  if (announcement) {
    announcements.push(announcement);
  }
  
  // Recursively render children
  for (const child of node.children) {
    renderNodeVoiceOver(child, announcements);
  }
}

/**
 * Formats a single node as a VoiceOver announcement.
 * 
 * @param node - Node to format
 * @returns Formatted announcement string or empty string if node should not be announced
 */
function formatNodeVoiceOver(node: AccessibleNode): string {
  const parts: string[] = [];
  
  // VoiceOver often announces role before name for some elements
  const roleFirst = shouldAnnounceRoleFirst(node.role);
  
  if (roleFirst) {
    // Add role first
    const roleText = formatRoleVoiceOver(node);
    if (roleText) {
      parts.push(roleText);
    }
    
    // Then name
    if (node.name) {
      parts.push(node.name);
    }
  } else {
    // Add name first
    if (node.name) {
      parts.push(node.name);
    }
    
    // Then role
    const roleText = formatRoleVoiceOver(node);
    if (roleText) {
      parts.push(roleText);
    }
  }
  
  // Add states
  const stateText = formatStatesVoiceOver(node);
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
 * Determines if role should be announced before name.
 * 
 * VoiceOver announces role first for headings and some landmarks.
 * 
 * @param role - Role to check
 * @returns true if role should be announced first
 */
function shouldAnnounceRoleFirst(role: AccessibleRole): boolean {
  return role === 'heading' || 
         role === 'navigation' ||
         role === 'main' ||
         role === 'banner' ||
         role === 'contentinfo' ||
         role === 'complementary' ||
         role === 'region' ||
         role === 'form' ||
         role === 'search';
}

/**
 * Formats the role portion of a VoiceOver announcement.
 * 
 * @param node - Node to format
 * @returns Role text or empty string
 */
function formatRoleVoiceOver(node: AccessibleNode): string {
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
      return 'edit text';
    
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
      return 'item';
    
    case 'navigation':
      return 'navigation';
    
    case 'main':
      return 'main';
    
    case 'banner':
      return 'banner';
    
    case 'contentinfo':
      return 'content information';
    
    case 'region':
      return 'region';
    
    case 'complementary':
      return 'complementary';
    
    case 'form':
      return 'form';
    
    case 'search':
      return 'search';
    
    case 'img':
      return 'image';
    
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
 * Formats the state portion of a VoiceOver announcement.
 * 
 * @param node - Node to format
 * @returns State text or empty string
 */
function formatStatesVoiceOver(node: AccessibleNode): string {
  const states: string[] = [];
  
  // Expanded/collapsed state
  if (node.state.expanded !== undefined) {
    states.push(node.state.expanded ? 'expanded' : 'collapsed');
  }
  
  // Checked state (checkbox/radio)
  if (node.state.checked !== undefined) {
    if (node.state.checked === 'mixed') {
      states.push('mixed');
    } else {
      states.push(node.state.checked ? 'checked' : 'unchecked');
    }
  }
  
  // Pressed state (toggle button)
  if (node.state.pressed !== undefined) {
    if (node.state.pressed === 'mixed') {
      states.push('mixed');
    } else {
      states.push(node.state.pressed ? 'pressed' : 'not pressed');
    }
  }
  
  // Selected state
  if (node.state.selected !== undefined) {
    states.push(node.state.selected ? 'selected' : 'unselected');
  }
  
  // Disabled state
  if (node.state.disabled) {
    states.push('dimmed');
  }
  
  // Invalid state
  if (node.state.invalid) {
    states.push('invalid data');
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
