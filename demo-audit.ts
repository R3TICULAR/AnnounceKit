/**
 * Demo script showing audit report renderer in action.
 * 
 * Run with: npx tsx demo-audit.ts
 */

import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from './src/extractor/tree-builder.js';
import { renderAuditReport } from './src/renderer/audit-renderer.js';

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                      AUDIT REPORT RENDERER DEMO                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

// Example 1: Good structure
console.log('═══ Example 1: Well-Structured Component ═══\n');
const goodHTML = `
<main>
  <h1>Welcome to Our Site</h1>
  <nav aria-label="Main navigation">
    <a href="/home">Home</a>
    <a href="/about" aria-current="page">About</a>
    <a href="/contact">Contact</a>
  </nav>
  <article>
    <h2>Latest News</h2>
    <p>Check out our updates...</p>
    <button aria-expanded="false">Read more</button>
  </article>
  <aside aria-label="Related links">
    <h3>Related</h3>
    <ul>
      <li><a href="/blog">Blog</a></li>
    </ul>
  </aside>
</main>
`;
console.log('HTML:', goodHTML.trim());
console.log('\n');
const goodDOM = new JSDOM(goodHTML);
const goodMain = goodDOM.window.document.querySelector('main')!;
const goodResult = buildAccessibilityTree(goodMain);
console.log(renderAuditReport(goodResult.model));
console.log('\n\n');

// Example 2: Component with issues
console.log('═══ Example 2: Component with Accessibility Issues ═══\n');
const badHTML = `
<div>
  <h3>Welcome</h3>
  <button></button>
  <img src="logo.png">
  <input type="text">
  <h1>About</h1>
  <nav>
    <a href="/home">Home</a>
  </nav>
  <nav>
    <a href="/about">About</a>
  </nav>
</div>
`;
console.log('HTML:', badHTML.trim());
console.log('\n');
const badDOM = new JSDOM(badHTML);
const badDiv = badDOM.window.document.querySelector('div')!;
const badResult = buildAccessibilityTree(badDiv);
console.log(renderAuditReport(badResult.model));
console.log('\n\n');

// Example 3: Simple form
console.log('═══ Example 3: Form Component ═══\n');
const formHTML = `
<form>
  <label for="name">Name</label>
  <input type="text" id="name" required>
  
  <label for="email">Email</label>
  <input type="email" id="email" required aria-invalid="true">
  
  <button type="submit">Submit</button>
</form>
`;
console.log('HTML:', formHTML.trim());
console.log('\n');
const formDOM = new JSDOM(formHTML);
const formElement = formDOM.window.document.querySelector('form')!;
const formResult = buildAccessibilityTree(formElement);
console.log(renderAuditReport(formResult.model));
console.log('\n\n');

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                              DEMO COMPLETE                                   ║');
console.log('║                                                                              ║');
console.log('║  The audit report provides:                                                  ║');
console.log('║  • Landmark structure analysis                                               ║');
console.log('║  • Heading hierarchy validation                                              ║');
console.log('║  • Interactive element inventory                                             ║');
console.log('║  • Common accessibility issue detection                                      ║');
console.log('║  • Summary statistics                                                        ║');
console.log('║  • Overall assessment with recommendations                                   ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
