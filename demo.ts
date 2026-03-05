/**
 * Demo script showing accessibility tree extraction in action.
 * 
 * Run with: npx tsx demo.ts
 */

import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from './src/extractor/tree-builder.js';
import { serializeModel } from './src/model/serialization.js';

// Example 1: Simple button
console.log('=== Example 1: Simple Button ===\n');
const buttonHTML = '<button>Click me</button>';
const buttonDOM = new JSDOM(buttonHTML);
const buttonElement = buttonDOM.window.document.querySelector('button')!;
const buttonResult = buildAccessibilityTree(buttonElement);
console.log('HTML:', buttonHTML);
console.log('Accessibility Tree:');
console.log(JSON.stringify(buttonResult.model.root, null, 2));
console.log();

// Example 2: Navigation with links
console.log('=== Example 2: Navigation with Links ===\n');
const navHTML = `
<nav aria-label="Main navigation">
  <a href="/home">Home</a>
  <a href="/about" aria-current="page">About</a>
  <a href="/contact">Contact</a>
</nav>
`;
const navDOM = new JSDOM(navHTML);
const navElement = navDOM.window.document.querySelector('nav')!;
const navResult = buildAccessibilityTree(navElement);
console.log('HTML:', navHTML.trim());
console.log('Accessibility Tree:');
console.log(JSON.stringify(navResult.model.root, null, 2));
console.log();

// Example 3: Form with validation
console.log('=== Example 3: Form with Validation ===\n');
const formHTML = `
<form>
  <label for="email">Email</label>
  <input type="email" id="email" value="user@example.com" required aria-invalid="true">
  <button type="submit">Submit</button>
</form>
`;
const formDOM = new JSDOM(formHTML);
const formElement = formDOM.window.document.querySelector('form')!;
const formResult = buildAccessibilityTree(formElement);
console.log('HTML:', formHTML.trim());
console.log('Accessibility Tree:');
console.log(JSON.stringify(formResult.model.root, null, 2));
console.log();

// Example 4: Accordion with expanded state
console.log('=== Example 4: Accordion with Expanded State ===\n');
const accordionHTML = `
<div>
  <button aria-expanded="true" aria-controls="panel1">Section 1</button>
  <div id="panel1" role="region">
    <button>Action inside panel</button>
  </div>
</div>
`;
const accordionDOM = new JSDOM(accordionHTML);
const accordionElement = accordionDOM.window.document.querySelector('div')!;
const accordionResult = buildAccessibilityTree(accordionElement);
console.log('HTML:', accordionHTML.trim());
console.log('Accessibility Tree:');
console.log(JSON.stringify(accordionResult.model.root, null, 2));
console.log();

// Example 5: Filtering aria-hidden elements
console.log('=== Example 5: Filtering aria-hidden Elements ===\n');
const hiddenHTML = `
<div>
  <button>Visible Button</button>
  <button aria-hidden="true">Hidden Button</button>
  <button>Another Visible Button</button>
</div>
`;
const hiddenDOM = new JSDOM(hiddenHTML);
const hiddenElement = hiddenDOM.window.document.querySelector('div')!;
const hiddenResult = buildAccessibilityTree(hiddenElement);
console.log('HTML:', hiddenHTML.trim());
console.log('Accessibility Tree (note: hidden button is filtered out):');
console.log(JSON.stringify(hiddenResult.model.root, null, 2));
console.log();

// Example 6: Full announcement model with serialization
console.log('=== Example 6: Full Announcement Model ===\n');
const fullHTML = `
<main>
  <h1>Welcome</h1>
  <nav aria-label="Main">
    <a href="/home">Home</a>
    <a href="/about">About</a>
  </nav>
  <article>
    <h2>Article Title</h2>
    <button aria-expanded="false">Read more</button>
  </article>
</main>
`;
const fullDOM = new JSDOM(fullHTML);
const fullElement = fullDOM.window.document.querySelector('main')!;
const fullResult = buildAccessibilityTree(fullElement, 'demo-hash-123');
console.log('HTML:', fullHTML.trim());
console.log('\nFull Announcement Model (serialized):');
console.log(serializeModel(fullResult.model));
console.log();

// Show warnings if any
if (fullResult.warnings.length > 0) {
  console.log('Warnings:');
  fullResult.warnings.forEach(w => console.log(`  - ${w.message}`));
} else {
  console.log('No warnings generated.');
}
