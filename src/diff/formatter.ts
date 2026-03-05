/**
 * Formatting utilities for semantic diff output.
 * 
 * Provides JSON and human-readable text formatting for diffs.
 */

import type { SemanticDiff, PropertyChange } from './types.js';

/**
 * Format a semantic diff as pretty-printed JSON.
 * 
 * @param diff - The semantic diff to format
 * @returns JSON string with 2-space indentation
 */
export function formatDiffAsJSON(diff: SemanticDiff): string {
  return JSON.stringify(diff, null, 2);
}

/**
 * Format a semantic diff as human-readable text.
 * 
 * @param diff - The semantic diff to format
 * @returns Multi-line text description of changes
 */
export function formatDiffAsText(diff: SemanticDiff): string {
  const lines: string[] = [];
  
  // Summary header
  lines.push('=== Accessibility Tree Diff ===');
  lines.push('');
  lines.push(`Total changes: ${diff.summary.total}`);
  lines.push(`  Added: ${diff.summary.added}`);
  lines.push(`  Removed: ${diff.summary.removed}`);
  lines.push(`  Changed: ${diff.summary.changed}`);
  lines.push('');
  
  if (diff.changes.length === 0) {
    lines.push('No changes detected.');
    return lines.join('\n');
  }
  
  // Group changes by type
  const added = diff.changes.filter(c => c.type === 'added');
  const removed = diff.changes.filter(c => c.type === 'removed');
  const changed = diff.changes.filter(c => c.type === 'changed');
  
  // Added nodes
  if (added.length > 0) {
    lines.push('--- Added Nodes ---');
    for (const change of added) {
      lines.push(`+ ${change.path}`);
      lines.push(`  Role: ${change.node?.role}`);
      lines.push(`  Name: "${change.node?.name}"`);
      if (change.node?.description) {
        lines.push(`  Description: "${change.node.description}"`);
      }
      lines.push('');
    }
  }
  
  // Removed nodes
  if (removed.length > 0) {
    lines.push('--- Removed Nodes ---');
    for (const change of removed) {
      lines.push(`- ${change.path}`);
      lines.push(`  Role: ${change.node?.role}`);
      lines.push(`  Name: "${change.node?.name}"`);
      if (change.node?.description) {
        lines.push(`  Description: "${change.node.description}"`);
      }
      lines.push('');
    }
  }
  
  // Changed nodes
  if (changed.length > 0) {
    lines.push('--- Changed Nodes ---');
    for (const change of changed) {
      lines.push(`~ ${change.path}`);
      if (change.changes) {
        for (const propChange of change.changes) {
          lines.push(`  ${formatPropertyChange(propChange)}`);
        }
      }
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Format a single property change as text.
 */
function formatPropertyChange(change: PropertyChange): string {
  const oldVal = formatValue(change.oldValue);
  const newVal = formatValue(change.newValue);
  return `${change.property}: ${oldVal} → ${newVal}`;
}

/**
 * Format a value for display.
 */
function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') {
    // For objects, show a compact representation
    const json = JSON.stringify(value);
    if (json.length > 50) {
      return json.substring(0, 47) + '...';
    }
    return json;
  }
  return String(value);
}

/**
 * Format a semantic diff for CI/CD tools (GitHub Actions, GitLab CI, etc.).
 * 
 * Uses a format that's easy to parse and diff-friendly.
 * 
 * @param diff - The semantic diff to format
 * @returns CI-friendly text output
 */
export function formatDiffForCI(diff: SemanticDiff): string {
  const lines: string[] = [];
  
  // Machine-readable summary line
  lines.push(`DIFF_SUMMARY: added=${diff.summary.added} removed=${diff.summary.removed} changed=${diff.summary.changed} total=${diff.summary.total}`);
  lines.push('');
  
  // One line per change for easy parsing
  for (const change of diff.changes) {
    switch (change.type) {
      case 'added':
        lines.push(`ADDED: ${change.path} | role=${change.node?.role} | name="${change.node?.name}"`);
        break;
      
      case 'removed':
        lines.push(`REMOVED: ${change.path} | role=${change.node?.role} | name="${change.node?.name}"`);
        break;
      
      case 'changed':
        const props = change.changes?.map(pc => 
          `${pc.property}:${formatValue(pc.oldValue)}->${formatValue(pc.newValue)}`
        ).join(' | ') || '';
        lines.push(`CHANGED: ${change.path} | ${props}`);
        break;
    }
  }
  
  return lines.join('\n');
}

/**
 * Check if a diff represents a regression (accessibility got worse).
 * 
 * Heuristics:
 * - Removed nodes with important roles (button, link, heading, etc.)
 * - Changed nodes that lost accessible names
 * - Changed nodes that became disabled or hidden
 * 
 * @param diff - The semantic diff to analyze
 * @returns True if potential regression detected
 */
export function hasAccessibilityRegression(diff: SemanticDiff): boolean {
  const importantRoles = new Set([
    'button', 'link', 'heading', 'textbox', 'checkbox', 'radio',
    'navigation', 'main', 'banner', 'contentinfo', 'form', 'search'
  ]);
  
  // Check for removed important nodes
  for (const change of diff.changes) {
    if (change.type === 'removed' && change.node?.role && importantRoles.has(change.node.role)) {
      return true;
    }
    
    // Check for nodes that lost their accessible name
    if (change.type === 'changed' && change.changes) {
      for (const propChange of change.changes) {
        if (propChange.property === 'name') {
          const oldName = propChange.oldValue as string;
          const newName = propChange.newValue as string;
          if (oldName && !newName) {
            return true;
          }
        }
        
        // Check for nodes that became hidden or disabled
        if (propChange.property === 'state') {
          const oldState = propChange.oldValue as any;
          const newState = propChange.newValue as any;
          if (!oldState?.hidden && newState?.hidden) {
            return true;
          }
          if (!oldState?.disabled && newState?.disabled) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}
