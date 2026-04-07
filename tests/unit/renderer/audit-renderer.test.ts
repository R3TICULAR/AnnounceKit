/**
 * Tests for audit report renderer.
 */

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from '../../../src/extractor/tree-builder.js';
import { renderAuditReport, generateAuditReport } from '../../../src/renderer/audit-renderer.js';

describe('generateAuditReport', () => {
  describe('statistics collection', () => {
    it('should count total elements', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
          <a href="/">Link</a>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      expect(report.statistics.totalElements).toBe(6);
    });

    it('should track role distribution', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
          <a href="/">Link</a>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      expect(report.statistics.roleDistribution.button).toBe(2);
      expect(report.statistics.roleDistribution.link).toBe(1);
    });

    it('should count landmarks', () => {
      const dom = new JSDOM(`
        <div>
          <nav aria-label="Main">Nav</nav>
          <main>Main</main>
          <aside>Aside</aside>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      expect(report.statistics.landmarkCount).toBe(3);
      expect(report.landmarks).toHaveLength(3);
    });

    it('should count headings', () => {
      const dom = new JSDOM(`
        <div>
          <h1>Title</h1>
          <h2>Subtitle</h2>
          <h3>Section</h3>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      expect(report.statistics.headingCount).toBe(3);
      expect(report.headings).toHaveLength(3);
    });

    it('should count interactive elements', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button</button>
          <a href="/">Link</a>
          <input type="text" aria-label="Input">
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      expect(report.statistics.interactiveCount).toBe(3);
      expect(report.interactiveElements).toHaveLength(3);
    });

    it('should count focusable elements', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button</button>
          <a href="/">Link</a>
          <h1>Heading</h1>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      expect(report.statistics.focusableCount).toBe(2); // button and link
    });
  });

  describe('landmark issue detection', () => {
    it('should detect missing landmarks', () => {
      const dom = new JSDOM('<div><button>Button</button></div>');
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      const noLandmarksIssue = report.issues.find(i => i.message.includes('No landmarks'));
      expect(noLandmarksIssue).toBeDefined();
      expect(noLandmarksIssue?.severity).toBe('info');
    });

    it('should detect unnamed navigation landmark', () => {
      const dom = new JSDOM('<nav><a href="/">Link</a></nav>');
      const nav = dom.window.document.querySelector('nav')!;
      const result = buildAccessibilityTree(nav);
      const report = generateAuditReport(result.model);
      
      const unnamedIssue = report.issues.find(i => i.message.includes('navigation landmark has no accessible name'));
      expect(unnamedIssue).toBeDefined();
      expect(unnamedIssue?.severity).toBe('warning');
    });

    it('should detect unnamed region landmark', () => {
      const dom = new JSDOM('<section role="region">Content</section>');
      const section = dom.window.document.querySelector('section')!;
      const result = buildAccessibilityTree(section);
      const report = generateAuditReport(result.model);
      
      const unnamedIssue = report.issues.find(i => i.message.includes('region landmark has no accessible name'));
      expect(unnamedIssue).toBeDefined();
    });

    it('should not flag named landmarks', () => {
      const dom = new JSDOM('<nav aria-label="Main navigation"><a href="/">Link</a></nav>');
      const nav = dom.window.document.querySelector('nav')!;
      const result = buildAccessibilityTree(nav);
      const report = generateAuditReport(result.model);
      
      const unnamedIssue = report.issues.find(i => i.message.includes('has no accessible name'));
      expect(unnamedIssue).toBeUndefined();
    });

    it('should detect duplicate landmarks without distinguishing names', () => {
      const dom = new JSDOM(`
        <div>
          <nav><a href="/">Link 1</a></nav>
          <nav><a href="/">Link 2</a></nav>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      const duplicateIssue = report.issues.find(i => i.message.includes('Multiple navigation landmarks'));
      expect(duplicateIssue).toBeDefined();
      expect(duplicateIssue?.severity).toBe('warning');
    });
  });

  describe('heading hierarchy issue detection', () => {
    it('should detect first heading not being h1', () => {
      const dom = new JSDOM('<h3>Section Title</h3>');
      const h3 = dom.window.document.querySelector('h3')!;
      const result = buildAccessibilityTree(h3);
      const report = generateAuditReport(result.model);
      
      const firstHeadingIssue = report.issues.find(i => i.message.includes('First heading is h3'));
      expect(firstHeadingIssue).toBeDefined();
      expect(firstHeadingIssue?.severity).toBe('error');
    });

    it('should detect skipped heading levels', () => {
      const dom = new JSDOM(`
        <div>
          <h1>Title</h1>
          <h3>Skipped h2</h3>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      const skippedIssue = report.issues.find(i => i.message.includes('skipped h2'));
      expect(skippedIssue).toBeDefined();
      expect(skippedIssue?.severity).toBe('error');
    });

    it('should not flag proper heading hierarchy', () => {
      const dom = new JSDOM(`
        <div>
          <h1>Title</h1>
          <h2>Subtitle</h2>
          <h3>Section</h3>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      const result = buildAccessibilityTree(div);
      const report = generateAuditReport(result.model);
      
      const hierarchyIssue = report.issues.find(i => i.message.includes('hierarchy'));
      expect(hierarchyIssue).toBeUndefined();
    });
  });

  describe('interactive element issue detection', () => {
    it('should detect button without name', () => {
      const dom = new JSDOM('<button></button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      const report = generateAuditReport(result.model);
      
      const noNameIssue = report.issues.find(i => i.message.includes('button has no accessible name'));
      expect(noNameIssue).toBeDefined();
      expect(noNameIssue?.severity).toBe('error');
    });

    it('should detect link without name', () => {
      const dom = new JSDOM('<a href="/"></a>');
      const link = dom.window.document.querySelector('a')!;
      const result = buildAccessibilityTree(link);
      const report = generateAuditReport(result.model);
      
      const noNameIssue = report.issues.find(i => i.message.includes('link has no accessible name'));
      expect(noNameIssue).toBeDefined();
    });

    it('should detect input without label', () => {
      const dom = new JSDOM('<input type="text">');
      const input = dom.window.document.querySelector('input')!;
      const result = buildAccessibilityTree(input);
      const report = generateAuditReport(result.model);
      
      const noLabelIssue = report.issues.find(i => i.message.includes('Input has no associated label'));
      expect(noLabelIssue).toBeDefined();
      expect(noLabelIssue?.severity).toBe('error');
    });

    it('should not flag elements with names', () => {
      const dom = new JSDOM('<button>Click me</button>');
      const button = dom.window.document.querySelector('button')!;
      const result = buildAccessibilityTree(button);
      const report = generateAuditReport(result.model);
      
      const noNameIssue = report.issues.find(i => i.message.includes('has no accessible name'));
      expect(noNameIssue).toBeUndefined();
    });
  });
});

describe('renderAuditReport', () => {
  it('should render complete audit report', () => {
    const dom = new JSDOM(`
      <main>
        <h1>Welcome</h1>
        <nav aria-label="Main">
          <a href="/">Home</a>
        </nav>
        <button>Click me</button>
      </main>
    `);
    const main = dom.window.document.querySelector('main')!;
    const result = buildAccessibilityTree(main);
    
    const report = renderAuditReport(result.model);
    
    expect(report).toContain('ACCESSIBILITY AUDIT REPORT');
    expect(report).toContain('LANDMARK STRUCTURE');
    expect(report).toContain('HEADING HIERARCHY');
    expect(report).toContain('INTERACTIVE ELEMENTS');
    expect(report).toContain('SUMMARY STATISTICS');
    expect(report).toContain('OVERALL ASSESSMENT');
  });

  it('should show landmark structure', () => {
    const dom = new JSDOM(`
      <div>
        <nav aria-label="Main">Nav</nav>
        <main>Main</main>
      </div>
    `);
    const div = dom.window.document.querySelector('div')!;
    const result = buildAccessibilityTree(div);
    
    const report = renderAuditReport(result.model);
    
    expect(report).toContain('2 landmark(s) found');
    expect(report).toContain('navigation "Main"');
    expect(report).toContain('main (unnamed)');
  });

  it('should show heading hierarchy', () => {
    const dom = new JSDOM(`
      <div>
        <h1>Title</h1>
        <h2>Subtitle</h2>
        <h3>Section</h3>
      </div>
    `);
    const div = dom.window.document.querySelector('div')!;
    const result = buildAccessibilityTree(div);
    
    const report = renderAuditReport(result.model);
    
    expect(report).toContain('3 heading(s) found');
    expect(report).toContain('h1 "Title"');
    expect(report).toContain('h2 "Subtitle"');
    expect(report).toContain('h3 "Section"');
  });

  it('should show interactive elements grouped by role', () => {
    const dom = new JSDOM(`
      <div>
        <button>Button 1</button>
        <button>Button 2</button>
        <a href="/">Link</a>
      </div>
    `);
    const div = dom.window.document.querySelector('div')!;
    const result = buildAccessibilityTree(div);
    
    const report = renderAuditReport(result.model);
    
    expect(report).toContain('3 interactive element(s) found');
    expect(report).toContain('buttons (2)');
    expect(report).toContain('links (1)');
  });

  it('should show issues section when issues exist', () => {
    const dom = new JSDOM('<h3>Wrong level</h3>');
    const h3 = dom.window.document.querySelector('h3')!;
    const result = buildAccessibilityTree(h3);
    
    const report = renderAuditReport(result.model);
    
    expect(report).toContain('ACCESSIBILITY ISSUES');
    expect(report).toContain('Error');
    expect(report).toContain('First heading is h3');
  });

  it('should show positive assessment when no issues', () => {
    const dom = new JSDOM(`
      <main>
        <h1>Title</h1>
        <button>Click me</button>
      </main>
    `);
    const main = dom.window.document.querySelector('main')!;
    const result = buildAccessibilityTree(main);
    
    const report = renderAuditReport(result.model);
    
    expect(report).toContain('Excellent! No critical issues found');
  });

  it('should show critical assessment when errors exist', () => {
    const dom = new JSDOM('<button></button>');
    const button = dom.window.document.querySelector('button')!;
    const result = buildAccessibilityTree(button);
    
    const report = renderAuditReport(result.model);
    
    expect(report).toContain('Critical accessibility issues found');
    expect(report).toContain('Recommendation: Address errors before deployment');
  });
});
