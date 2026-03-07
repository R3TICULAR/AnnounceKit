/**
 * Demo script showing NVDA renderer in action.
 * 
 * Run with: npx tsx demo-nvda.ts
 */

import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from './src/extractor/tree-builder.js';
import { renderNVDA } from './src/renderer/nvda-renderer.js';

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                         NVDA RENDERER DEMO                                   ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

// Example 1: Simple button
console.log('═══ Example 1: Simple Button ═══\n');
const buttonHTML = '<button>Click me</button>';
console.log('HTML:', buttonHTML);
const buttonDOM = new JSDOM(buttonHTML);
const buttonElement = buttonDOM.window.document.querySelector('button')!;
const buttonResult = buildAccessibilityTree(buttonElement);
console.log('\nNVDA announces:');
console.log(renderNVDA(buttonResult.model));
console.log();

// Example 2: Navigation with current page
console.log('═══ Example 2: Navigation with Current Page ═══\n');
const navHTML = `
<nav aria-label="Main navigation">
  <a href="/home">Home</a>
  <a href="/about" aria-current="page">About</a>
  <a href="/contact">Contact</a>
</nav>
`;
console.log('HTML:', navHTML.trim());
const navDOM = new JSDOM(navHTML);
const navElement = navDOM.window.document.querySelector('nav')!;
const navResult = buildAccessibilityTree(navElement);
console.log('\nNVDA announces:');
console.log(renderNVDA(navResult.model));
console.log();

// Example 3: Form with validation
console.log('═══ Example 3: Form with Validation ═══\n');
const formHTML = `
<form>
  <label for="email">Email</label>
  <input type="email" id="email" value="user@example.com" required aria-invalid="true">
  <button type="submit">Submit</button>
</form>
`;
console.log('HTML:', formHTML.trim());
const formDOM = new JSDOM(formHTML);
const formElement = formDOM.window.document.querySelector('form')!;
const formResult = buildAccessibilityTree(formElement);
console.log('\nNVDA announces:');
console.log(renderNVDA(formResult.model));
console.log();

// Example 4: Accordion with expanded state
console.log('═══ Example 4: Accordion (Expanded) ═══\n');
const accordionHTML = `
<div>
  <button aria-expanded="true" aria-controls="panel1">Section 1</button>
  <div id="panel1" role="region">
    <button>Action inside panel</button>
  </div>
</div>
`;
console.log('HTML:', accordionHTML.trim());
const accordionDOM = new JSDOM(accordionHTML);
const accordionElement = accordionDOM.window.document.querySelector('div')!;
const accordionResult = buildAccessibilityTree(accordionElement);
console.log('\nNVDA announces:');
console.log(renderNVDA(accordionResult.model));
console.log();

// Example 5: Checkbox states
console.log('═══ Example 5: Checkbox States ═══\n');
const checkboxHTML = `
<div>
  <input type="checkbox" checked aria-label="Accept terms">
  <input type="checkbox" aria-label="Subscribe to newsletter">
  <input type="checkbox" aria-checked="mixed" aria-label="Select all">
</div>
`;
console.log('HTML:', checkboxHTML.trim());
const checkboxDOM = new JSDOM(checkboxHTML);
const checkboxDiv = checkboxDOM.window.document.querySelector('div')!;
const checkboxResult = buildAccessibilityTree(checkboxDiv);
console.log('\nNVDA announces:');
console.log(renderNVDA(checkboxResult.model));
console.log();

// Example 6: Heading hierarchy
console.log('═══ Example 6: Heading Hierarchy ═══\n');
const headingHTML = `
<main>
  <h1>Welcome to Our Site</h1>
  <article>
    <h2>Latest News</h2>
    <h3>Breaking Story</h3>
  </article>
</main>
`;
console.log('HTML:', headingHTML.trim());
const headingDOM = new JSDOM(headingHTML);
const mainElement = headingDOM.window.document.querySelector('main')!;
const headingResult = buildAccessibilityTree(mainElement);
console.log('\nNVDA announces:');
console.log(renderNVDA(headingResult.model));
console.log();

// Example 7: List structure
console.log('═══ Example 7: List Structure ═══\n');
const listHTML = `
<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>
`;
console.log('HTML:', listHTML.trim());
const listDOM = new JSDOM(listHTML);
const listElement = listDOM.window.document.querySelector('ul')!;
const listResult = buildAccessibilityTree(listElement);
console.log('\nNVDA announces:');
console.log(renderNVDA(listResult.model));
console.log();

// Example 8: Complex page structure
console.log('═══ Example 8: Complex Page Structure ═══\n');
const complexHTML = `
<div>
  <header>
    <nav aria-label="Main">
      <a href="/">Home</a>
    </nav>
  </header>
  <main>
    <h1>Page Title</h1>
    <article>
      <h2>Article Heading</h2>
      <button aria-expanded="false">Read more</button>
    </article>
  </main>
  <aside aria-label="Sidebar">
    <h3>Related Links</h3>
  </aside>
</div>
`;
console.log('HTML:', complexHTML.trim());
const complexDOM = new JSDOM(complexHTML);
const complexDiv = complexDOM.window.document.querySelector('div')!;
const complexResult = buildAccessibilityTree(complexDiv);
console.log('\nNVDA announces:');
console.log(renderNVDA(complexResult.model));
console.log();

// Example 9: Disabled and readonly states
console.log('═══ Example 9: Disabled and Readonly States ═══\n');
const statesHTML = `
<div>
  <button disabled>Disabled Button</button>
  <input type="text" readonly value="Read only text" aria-label="Status">
</div>
`;
console.log('HTML:', statesHTML.trim());
const statesDOM = new JSDOM(statesHTML);
const statesDiv = statesDOM.window.document.querySelector('div')!;
const statesResult = buildAccessibilityTree(statesDiv);
console.log('\nNVDA announces:');
console.log(renderNVDA(statesResult.model));
console.log();

// Example 10: Image with alt text
console.log('═══ Example 10: Image with Alt Text ═══\n');
const imgHTML = '<img src="logo.png" alt="Company Logo">';
console.log('HTML:', imgHTML);
const imgDOM = new JSDOM(imgHTML);
const imgElement = imgDOM.window.document.querySelector('img')!;
const imgResult = buildAccessibilityTree(imgElement);
console.log('\nNVDA announces:');
console.log(renderNVDA(imgResult.model));
console.log();

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                              DEMO COMPLETE                                   ║');
console.log('║                                                                              ║');
console.log('║  Note: This is a heuristic approximation of NVDA output.                    ║');
console.log('║  Real NVDA behavior varies by version, settings, and context.               ║');
console.log('║  Use for development guidance only, not as a replacement for real testing.  ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
