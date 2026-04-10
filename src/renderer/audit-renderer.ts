/**
 * Developer-friendly audit report renderer.
 * 
 * Generates human-readable accessibility audit reports with:
 * - Landmark structure analysis
 * - Heading hierarchy validation
 * - Interactive element inventory
 * - Common accessibility issue detection
 * - Summary statistics
 */

import type { AccessibleNode, AccessibleRole, AnnouncementModel } from '../model/types.js';
import { createColors } from '../cli/colors.js';

/**
 * Severity level for accessibility issues.
 */
export type IssueSeverity = 'error' | 'warning' | 'info';

/**
 * Accessibility issue detected during audit.
 */
export interface AccessibilityIssue {
  severity: IssueSeverity;
  message: string;
  suggestion?: string;
  element?: {
    role: AccessibleRole;
    name: string;
  };
}

/**
 * Audit report statistics.
 */
export interface AuditStatistics {
  totalElements: number;
  roleDistribution: Record<string, number>;
  landmarkCount: number;
  headingCount: number;
  interactiveCount: number;
  focusableCount: number;
  statesUsed: Set<string>;
}

/**
 * Complete audit report.
 */
export interface AuditReport {
  statistics: AuditStatistics;
  landmarks: AccessibleNode[];
  headings: AccessibleNode[];
  interactiveElements: AccessibleNode[];
  issues: AccessibilityIssue[];
}

/**
 * Renders an announcement model as a developer-friendly audit report.
 * 
 * @param model - Announcement model to audit
 * @returns Formatted audit report text
 */
export function renderAuditReport(model: AnnouncementModel, colorize?: boolean): string {
  const report = generateAuditReport(model);
  return formatAuditReport(report, model, colorize);
}

/**
 * Generates audit report data from an announcement model.
 * 
 * @param model - Announcement model to analyze
 * @returns Audit report data
 */
export function generateAuditReport(model: AnnouncementModel): AuditReport {
  const statistics: AuditStatistics = {
    totalElements: 0,
    roleDistribution: {},
    landmarkCount: 0,
    headingCount: 0,
    interactiveCount: 0,
    focusableCount: 0,
    statesUsed: new Set(),
  };
  
  const landmarks: AccessibleNode[] = [];
  const headings: AccessibleNode[] = [];
  const interactiveElements: AccessibleNode[] = [];
  const issues: AccessibilityIssue[] = [];
  
  // Collect data from tree
  collectAuditData(model.root, statistics, landmarks, headings, interactiveElements);
  
  // Detect issues
  detectLandmarkIssues(landmarks, issues);
  detectHeadingIssues(headings, issues);
  detectInteractiveIssues(interactiveElements, issues);
  
  return {
    statistics,
    landmarks,
    headings,
    interactiveElements,
    issues,
  };
}

/**
 * Recursively collects audit data from the accessibility tree.
 */
function collectAuditData(
  node: AccessibleNode,
  statistics: AuditStatistics,
  landmarks: AccessibleNode[],
  headings: AccessibleNode[],
  interactiveElements: AccessibleNode[]
): void {
  // Skip generic containers in statistics
  if (node.role !== 'generic') {
    statistics.totalElements++;
    
    // Update role distribution
    statistics.roleDistribution[node.role] = (statistics.roleDistribution[node.role] || 0) + 1;
    
    // Collect landmarks
    if (isLandmark(node.role)) {
      statistics.landmarkCount++;
      landmarks.push(node);
    }
    
    // Collect headings
    if (node.role === 'heading') {
      statistics.headingCount++;
      headings.push(node);
    }
    
    // Collect interactive elements
    if (isInteractive(node.role)) {
      statistics.interactiveCount++;
      interactiveElements.push(node);
    }
    
    // Count focusable elements
    if (node.focus.focusable) {
      statistics.focusableCount++;
    }
    
    // Collect states used
    Object.keys(node.state).forEach(state => {
      if (node.state[state as keyof typeof node.state] !== undefined) {
        statistics.statesUsed.add(state);
      }
    });
  }
  
  // Recurse through children
  for (const child of node.children) {
    collectAuditData(child, statistics, landmarks, headings, interactiveElements);
  }
}

/**
 * Checks if a role is a landmark.
 */
function isLandmark(role: AccessibleRole): boolean {
  return [
    'navigation',
    'main',
    'banner',
    'contentinfo',
    'region',
    'complementary',
    'form',
    'search',
  ].includes(role);
}

/**
 * Checks if a role is interactive.
 */
function isInteractive(role: AccessibleRole): boolean {
  return [
    'button',
    'link',
    'textbox',
    'checkbox',
    'radio',
    'combobox',
    'listbox',
    'option',
  ].includes(role);
}

/**
 * Detects issues with landmarks.
 */
function detectLandmarkIssues(landmarks: AccessibleNode[], issues: AccessibilityIssue[]): void {
  if (landmarks.length === 0) {
    issues.push({
      severity: 'info',
      message: 'No landmarks found',
      suggestion: 'Consider adding semantic landmarks (main, nav, aside, etc.)',
    });
  }
  
  // Check for unnamed landmarks
  landmarks.forEach(landmark => {
    if (!landmark.name && ['navigation', 'region', 'complementary', 'form'].includes(landmark.role)) {
      issues.push({
        severity: 'warning',
        message: `${landmark.role} landmark has no accessible name`,
        suggestion: `Add aria-label="${landmark.role === 'navigation' ? 'Main navigation' : 'Descriptive name'}" to the ${landmark.role} element`,
        element: {
          role: landmark.role,
          name: landmark.name,
        },
      });
    }
  });
  
  // Check for duplicate landmark roles without distinguishing names
  const landmarksByRole = new Map<string, AccessibleNode[]>();
  landmarks.forEach(landmark => {
    if (!landmarksByRole.has(landmark.role)) {
      landmarksByRole.set(landmark.role, []);
    }
    landmarksByRole.get(landmark.role)!.push(landmark);
  });
  
  landmarksByRole.forEach((nodes, role) => {
    if (nodes.length > 1) {
      const allUnnamed = nodes.every(n => !n.name);
      const allSameName = nodes.every(n => n.name === nodes[0].name);
      
      if (allUnnamed || allSameName) {
        issues.push({
          severity: 'warning',
          message: `Multiple ${role} landmarks without distinguishing names`,
          suggestion: `Add unique aria-label attributes to distinguish between ${role} landmarks`,
        });
      }
    }
  });
}

/**
 * Detects issues with heading hierarchy.
 */
function detectHeadingIssues(headings: AccessibleNode[], issues: AccessibilityIssue[]): void {
  if (headings.length === 0) {
    return;
  }
  
  // Check if first heading is h1
  const firstHeading = headings[0];
  if (firstHeading.state.level && firstHeading.state.level !== 1) {
    issues.push({
      severity: 'error',
      message: `First heading is h${firstHeading.state.level} (should be h1)`,
      suggestion: `Change <h${firstHeading.state.level}> to <h1> or add h1 before it`,
      element: {
        role: firstHeading.role,
        name: firstHeading.name,
      },
    });
  }
  
  // Check for skipped levels
  for (let i = 1; i < headings.length; i++) {
    const prevLevel = headings[i - 1].state.level || 1;
    const currLevel = headings[i].state.level || 1;
    
    if (currLevel > prevLevel + 1) {
      issues.push({
        severity: 'error',
        message: `Heading hierarchy violation: h${prevLevel} followed by h${currLevel} (skipped h${prevLevel + 1})`,
        suggestion: `Change h${currLevel} to h${prevLevel + 1} or add intermediate heading levels`,
        element: {
          role: headings[i].role,
          name: headings[i].name,
        },
      });
    }
  }
}

/**
 * Detects issues with interactive elements.
 */
function detectInteractiveIssues(elements: AccessibleNode[], issues: AccessibilityIssue[]): void {
  elements.forEach(element => {
    // Check for missing names
    if (!element.name) {
      issues.push({
        severity: 'error',
        message: `${element.role} has no accessible name`,
        suggestion: element.role === 'button' 
          ? 'Add text content or aria-label to button'
          : element.role === 'link'
          ? 'Add text content or aria-label to link'
          : `Add aria-label to ${element.role}`,
        element: {
          role: element.role,
          name: element.name,
        },
      });
    }
    
    // Check for form inputs without labels
    if (element.role === 'textbox' && !element.name) {
      issues.push({
        severity: 'error',
        message: 'Input has no associated label',
        suggestion: 'Add <label> element or aria-label attribute',
        element: {
          role: element.role,
          name: element.name,
        },
      });
    }
  });
}

/**
 * Formats audit report as human-readable text.
 */
function formatAuditReport(report: AuditReport, model: AnnouncementModel, colorize?: boolean): string {
  const c = createColors(colorize ?? false);
  const lines: string[] = [];
  
  // Header
  lines.push(c.title('╔══════════════════════════════════════════════════════════════════════════════╗'));
  lines.push(c.title('║                      ACCESSIBILITY AUDIT REPORT                              ║'));
  lines.push(c.title('╚══════════════════════════════════════════════════════════════════════════════╝'));
  lines.push('');
  lines.push(c.dim(`Analyzed: ${model.metadata.extractedAt}`));
  lines.push('');
  
  // Landmark structure
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(c.heading('📍 LANDMARK STRUCTURE'));
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  
  if (report.landmarks.length === 0) {
    lines.push(c.error('✗ No landmarks found'));
  } else {
    lines.push(c.success(`✓ ${report.landmarks.length} landmark(s) found`));
    lines.push('');
    report.landmarks.forEach(landmark => {
      const name = landmark.name ? `"${landmark.name}"` : '(unnamed)';
      lines.push(`${landmark.role} ${name}`);
    });
  }
  lines.push('');
  
  // Heading hierarchy
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(c.heading('📑 HEADING HIERARCHY'));
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  
  if (report.headings.length === 0) {
    lines.push(c.info('ℹ No headings found'));
  } else {
    const hasHierarchyIssues = report.issues.some(i => 
      i.message.includes('heading') || i.message.includes('h1') || i.message.includes('h2')
    );
    lines.push(`${hasHierarchyIssues ? c.error('✗') : c.success('✓')} ${report.headings.length} heading(s) found ${hasHierarchyIssues ? '(HIERARCHY VIOLATION)' : '(proper hierarchy)'}`);
    lines.push('');
    
    let prevLevel = 0;
    report.headings.forEach(heading => {
      const level = heading.state.level || 1;
      const indent = '  '.repeat(level - 1);
      lines.push(`${indent}h${level} "${heading.name}"`);
      prevLevel = level;
    });
  }
  lines.push('');
  
  // Interactive elements
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(c.heading('🎯 INTERACTIVE ELEMENTS'));
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  
  if (report.interactiveElements.length === 0) {
    lines.push(c.info('ℹ No interactive elements found'));
  } else {
    lines.push(c.success(`✓ ${report.interactiveElements.length} interactive element(s) found`));
    lines.push('');
    
    // Group by role
    const byRole = new Map<string, AccessibleNode[]>();
    report.interactiveElements.forEach(el => {
      if (!byRole.has(el.role)) {
        byRole.set(el.role, []);
      }
      byRole.get(el.role)!.push(el);
    });
    
    byRole.forEach((elements, role) => {
      lines.push(`${role}s (${elements.length}):`);
      elements.forEach(el => {
        const name = el.name ? `"${el.name}"` : '(unnamed)';
        const states = Object.keys(el.state).filter(k => el.state[k as keyof typeof el.state] !== undefined);
        const stateStr = states.length > 0 ? ` [${states.join(', ')}]` : '';
        lines.push(`  • ${name}${stateStr}`);
      });
    });
  }
  lines.push('');
  
  // Summary statistics
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(c.heading('📊 SUMMARY STATISTICS'));
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`Total accessible elements: ${report.statistics.totalElements}`);
  lines.push('');
  lines.push('Role distribution:');
  Object.entries(report.statistics.roleDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([role, count]) => {
      lines.push(c.dim(`  • ${role}: ${count}`));
    });
  lines.push('');
  lines.push(c.dim(`Focusable elements: ${report.statistics.focusableCount}`));
  lines.push('');
  
  // Issues
  if (report.issues.length > 0) {
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(c.heading('⚠️  ACCESSIBILITY ISSUES'));
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    
    const errors = report.issues.filter(i => i.severity === 'error');
    const warnings = report.issues.filter(i => i.severity === 'warning');
    const infos = report.issues.filter(i => i.severity === 'info');
    
    if (errors.length > 0) {
      lines.push(c.error(`✗ Error (${errors.length}):`));
      errors.forEach(issue => {
        lines.push(c.error(`  • ${issue.message}`));
        if (issue.suggestion) {
          lines.push(`    → ${issue.suggestion}`);
        }
      });
      lines.push('');
    }
    
    if (warnings.length > 0) {
      lines.push(c.warning(`⚠ Warning (${warnings.length}):`));
      warnings.forEach(issue => {
        lines.push(c.warning(`  • ${issue.message}`));
        if (issue.suggestion) {
          lines.push(`    → ${issue.suggestion}`);
        }
      });
      lines.push('');
    }
    
    if (infos.length > 0) {
      lines.push(c.info(`ℹ Info (${infos.length}):`));
      infos.forEach(issue => {
        lines.push(c.info(`  • ${issue.message}`));
        if (issue.suggestion) {
          lines.push(`    → ${issue.suggestion}`);
        }
      });
      lines.push('');
    }
  }
  
  // Overall assessment
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(c.success('✅ OVERALL ASSESSMENT'));
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  
  const errorCount = report.issues.filter(i => i.severity === 'error').length;
  const warningCount = report.issues.filter(i => i.severity === 'warning').length;
  
  if (errorCount === 0 && warningCount === 0) {
    lines.push(c.success('Excellent! No critical issues found.'));
  } else if (errorCount > 0) {
    lines.push(`Critical accessibility issues found:`);
    lines.push(c.error(`  ✗ ${errorCount} error(s)`));
    if (warningCount > 0) {
      lines.push(c.warning(`  ⚠ ${warningCount} warning(s)`));
    }
    lines.push('');
    lines.push('Recommendation: Address errors before deployment');
  } else {
    lines.push(`Good structure with minor improvements needed:`);
    lines.push(c.warning(`  ⚠ ${warningCount} warning(s)`));
  }
  
  return lines.join('\n');
}
