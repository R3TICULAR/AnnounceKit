/**
 * Demo: Semantic Diff Functionality
 * 
 * This demo shows how to compare two accessibility trees and detect changes.
 * Useful for CI/CD pipelines to catch accessibility regressions.
 */

import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from './src/extractor/index.js';
import { 
  diffAccessibilityTrees, 
  formatDiffAsText, 
  formatDiffAsJSON,
  formatDiffForCI,
  hasAccessibilityRegression 
} from './src/diff/index.js';

console.log('='.repeat(80));
console.log('SEMANTIC DIFF DEMO');
console.log('='.repeat(80));
console.log();

// Example 1: Detecting added elements
console.log('Example 1: Detecting Added Elements');
console.log('-'.repeat(80));

const oldHTML1 = `
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
  </nav>
`;

const newHTML1 = `
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
`;

const oldDoc1 = new JSDOM(oldHTML1);
const newDoc1 = new JSDOM(newHTML1);
const oldTree1 = buildAccessibilityTree(oldDoc1.window.document.querySelector('nav')!);
const newTree1 = buildAccessibilityTree(newDoc1.window.document.querySelector('nav')!);
const diff1 = diffAccessibilityTrees(oldTree1.model.root, newTree1.model.root);

console.log(formatDiffAsText(diff1));
console.log();

// Example 2: Detecting removed elements
console.log('Example 2: Detecting Removed Elements');
console.log('-'.repeat(80));

const oldHTML2 = `
  <form>
    <label for="username">Username</label>
    <input type="text" id="username" />
    <label for="password">Password</label>
    <input type="password" id="password" />
    <button type="submit">Login</button>
  </form>
`;

const newHTML2 = `
  <form>
    <label for="username">Username</label>
    <input type="text" id="username" />
    <button type="submit">Login</button>
  </form>
`;

const oldDoc2 = new JSDOM(oldHTML2);
const newDoc2 = new JSDOM(newHTML2);
const oldTree2 = buildAccessibilityTree(oldDoc2.window.document.querySelector('form')!);
const newTree2 = buildAccessibilityTree(newDoc2.window.document.querySelector('form')!);
const diff2 = diffAccessibilityTrees(oldTree2.model.root, newTree2.model.root);

console.log(formatDiffAsText(diff2));
console.log();

// Example 3: Detecting changed properties
console.log('Example 3: Detecting Changed Properties');
console.log('-'.repeat(80));

const oldHTML3 = `
  <button aria-label="Submit form">Submit</button>
`;

const newHTML3 = `
  <button aria-label="Send form data">Send</button>
`;

const oldDoc3 = new JSDOM(oldHTML3);
const newDoc3 = new JSDOM(newHTML3);
const oldTree3 = buildAccessibilityTree(oldDoc3.window.document.querySelector('button')!);
const newTree3 = buildAccessibilityTree(newDoc3.window.document.querySelector('button')!);
const diff3 = diffAccessibilityTrees(oldTree3.model.root, newTree3.model.root);

console.log(formatDiffAsText(diff3));
console.log();

// Example 4: Detecting state changes
console.log('Example 4: Detecting State Changes');
console.log('-'.repeat(80));

const oldHTML4 = `
  <button aria-expanded="false">Menu</button>
`;

const newHTML4 = `
  <button aria-expanded="true">Menu</button>
`;

const oldDoc4 = new JSDOM(oldHTML4);
const newDoc4 = new JSDOM(newHTML4);
const oldTree4 = buildAccessibilityTree(oldDoc4.window.document.querySelector('button')!);
const newTree4 = buildAccessibilityTree(newDoc4.window.document.querySelector('button')!);
const diff4 = diffAccessibilityTrees(oldTree4.model.root, newTree4.model.root);

console.log(formatDiffAsText(diff4));
console.log();

// Example 5: Accessibility regression detection
console.log('Example 5: Accessibility Regression Detection');
console.log('-'.repeat(80));

const oldHTML5 = `
  <button>Submit</button>
`;

const newHTML5 = `
  <button disabled>Submit</button>
`;

const oldDoc5 = new JSDOM(oldHTML5);
const newDoc5 = new JSDOM(newHTML5);
const oldTree5 = buildAccessibilityTree(oldDoc5.window.document.querySelector('button')!);
const newTree5 = buildAccessibilityTree(newDoc5.window.document.querySelector('button')!);
const diff5 = diffAccessibilityTrees(oldTree5.model.root, newTree5.model.root);

console.log(formatDiffAsText(diff5));
console.log();
console.log(`⚠️  Regression detected: ${hasAccessibilityRegression(diff5)}`);
console.log();

// Example 6: CI-friendly output format
console.log('Example 6: CI-Friendly Output Format');
console.log('-'.repeat(80));

const oldHTML6 = `
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
`;

const newHTML6 = `
  <nav>
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <a href="/contact">Contact</a>
  </nav>
`;

const oldDoc6 = new JSDOM(oldHTML6);
const newDoc6 = new JSDOM(newHTML6);
const oldTree6 = buildAccessibilityTree(oldDoc6.window.document.querySelector('nav')!);
const newTree6 = buildAccessibilityTree(newDoc6.window.document.querySelector('nav')!);
const diff6 = diffAccessibilityTrees(oldTree6.model.root, newTree6.model.root);

console.log(formatDiffForCI(diff6));
console.log();

// Example 7: Complex nested changes
console.log('Example 7: Complex Nested Changes');
console.log('-'.repeat(80));

const oldHTML7 = `
  <main>
    <article>
      <h1>Welcome</h1>
      <p>Content here</p>
    </article>
  </main>
`;

const newHTML7 = `
  <main>
    <article>
      <h1>Welcome to Our Site</h1>
      <p>Updated content here</p>
      <button>Learn More</button>
    </article>
  </main>
`;

const oldDoc7 = new JSDOM(oldHTML7);
const newDoc7 = new JSDOM(newHTML7);
const oldTree7 = buildAccessibilityTree(oldDoc7.window.document.querySelector('main')!);
const newTree7 = buildAccessibilityTree(newDoc7.window.document.querySelector('main')!);
const diff7 = diffAccessibilityTrees(oldTree7.model.root, newTree7.model.root);

console.log(formatDiffAsText(diff7));
console.log();

// Example 8: No changes (identical trees)
console.log('Example 8: No Changes (Identical Trees)');
console.log('-'.repeat(80));

const html8 = `
  <button>Click me</button>
`;

const doc8a = new JSDOM(html8);
const doc8b = new JSDOM(html8);
const tree8a = buildAccessibilityTree(doc8a.window.document.querySelector('button')!);
const tree8b = buildAccessibilityTree(doc8b.window.document.querySelector('button')!);
const diff8 = diffAccessibilityTrees(tree8a.model.root, tree8b.model.root);

console.log(formatDiffAsText(diff8));
console.log();

// Example 9: JSON output for programmatic use
console.log('Example 9: JSON Output for Programmatic Use');
console.log('-'.repeat(80));

const oldHTML9 = `<button>Old</button>`;
const newHTML9 = `<button>New</button>`;

const oldDoc9 = new JSDOM(oldHTML9);
const newDoc9 = new JSDOM(newHTML9);
const oldTree9 = buildAccessibilityTree(oldDoc9.window.document.querySelector('button')!);
const newTree9 = buildAccessibilityTree(newDoc9.window.document.querySelector('button')!);
const diff9 = diffAccessibilityTrees(oldTree9.model.root, newTree9.model.root);

console.log(formatDiffAsJSON(diff9));
console.log();

// Example 10: Detecting lost accessible names (regression)
console.log('Example 10: Detecting Lost Accessible Names (Regression)');
console.log('-'.repeat(80));

const oldHTML10 = `
  <button aria-label="Submit form">Submit</button>
`;

const newHTML10 = `
  <button></button>
`;

const oldDoc10 = new JSDOM(oldHTML10);
const newDoc10 = new JSDOM(newHTML10);
const oldTree10 = buildAccessibilityTree(oldDoc10.window.document.querySelector('button')!);
const newTree10 = buildAccessibilityTree(newDoc10.window.document.querySelector('button')!);
const diff10 = diffAccessibilityTrees(oldTree10.model.root, newTree10.model.root);

console.log(formatDiffAsText(diff10));
console.log();
console.log(`⚠️  Regression detected: ${hasAccessibilityRegression(diff10)}`);
console.log();

console.log('='.repeat(80));
console.log('DEMO COMPLETE');
console.log('='.repeat(80));
console.log();
console.log('Key Features Demonstrated:');
console.log('  ✓ Detect added nodes');
console.log('  ✓ Detect removed nodes');
console.log('  ✓ Detect changed properties (name, role, state, etc.)');
console.log('  ✓ Detect accessibility regressions');
console.log('  ✓ Multiple output formats (text, JSON, CI-friendly)');
console.log('  ✓ Path-based change tracking');
console.log();
console.log('Use Cases:');
console.log('  • CI/CD pipeline integration');
console.log('  • Accessibility regression testing');
console.log('  • Component library change tracking');
console.log('  • Automated accessibility audits');
console.log();
