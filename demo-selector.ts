/**
 * Demo script showing CSS selector filtering in action.
 * 
 * Run with: npx tsx demo-selector.ts
 */

import { JSDOM } from 'jsdom';
import { buildAccessibilityTreeWithSelector, SelectorError } from './src/extractor/tree-builder.js';
import { serializeModel } from './src/model/serialization.js';

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    CSS SELECTOR FILTERING DEMO                               ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

// Example HTML with multiple components
const pageHTML = `
<html>
  <body>
    <header>
      <nav aria-label="Main navigation">
        <a href="/home">Home</a>
        <a href="/about" aria-current="page">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
    
    <main>
      <article class="featured">
        <h2>Featured Article</h2>
        <p>This is the featured content...</p>
        <button aria-expanded="false">Read more</button>
      </article>
      
      <article class="regular">
        <h2>Regular Article 1</h2>
        <p>Some content here...</p>
        <button>Read more</button>
      </article>
      
      <article class="regular">
        <h2>Regular Article 2</h2>
        <p>More content here...</p>
        <button>Read more</button>
      </article>
    </main>
    
    <aside>
      <h3>Sidebar</h3>
      <form>
        <label for="email">Email</label>
        <input type="email" id="email" required>
        <button type="submit">Subscribe</button>
      </form>
    </aside>
  </body>
</html>
`;

const dom = new JSDOM(pageHTML);
const body = dom.window.document.body;

// Example 1: Select all navigation elements
console.log('═══ Example 1: Select Navigation ═══\n');
console.log('Selector: "nav"\n');
try {
  const navResults = buildAccessibilityTreeWithSelector(body, 'nav');
  console.log(`Found ${navResults.length} navigation element(s)\n`);
  navResults.forEach((result, i) => {
    console.log(`Navigation ${i + 1}:`);
    console.log(`  Name: "${result.model.root.name}"`);
    console.log(`  Children: ${result.model.root.children.length} links`);
    result.model.root.children.forEach(child => {
      console.log(`    - ${child.name}${child.state.current ? ' (current page)' : ''}`);
    });
  });
} catch (error) {
  console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
console.log();

// Example 2: Select only featured article
console.log('═══ Example 2: Select Featured Article ═══\n');
console.log('Selector: "article.featured"\n');
try {
  const featuredResults = buildAccessibilityTreeWithSelector(body, 'article.featured');
  console.log(`Found ${featuredResults.length} featured article(s)\n`);
  featuredResults.forEach(result => {
    console.log('Article structure:');
    console.log(JSON.stringify(result.model.root, null, 2));
  });
} catch (error) {
  console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
console.log();

// Example 3: Select all buttons
console.log('═══ Example 3: Select All Buttons ═══\n');
console.log('Selector: "button"\n');
try {
  const buttonResults = buildAccessibilityTreeWithSelector(body, 'button');
  console.log(`Found ${buttonResults.length} button(s)\n`);
  buttonResults.forEach((result, i) => {
    const button = result.model.root;
    console.log(`Button ${i + 1}:`);
    console.log(`  Name: "${button.name}"`);
    console.log(`  Focusable: ${button.focus.focusable}`);
    if (button.state.expanded !== undefined) {
      console.log(`  Expanded: ${button.state.expanded}`);
    }
  });
} catch (error) {
  console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
console.log();

// Example 4: Select form inputs with required attribute
console.log('═══ Example 4: Select Required Form Inputs ═══\n');
console.log('Selector: "input[required]"\n');
try {
  const inputResults = buildAccessibilityTreeWithSelector(body, 'input[required]');
  console.log(`Found ${inputResults.length} required input(s)\n`);
  inputResults.forEach(result => {
    const input = result.model.root;
    console.log(`Input:`);
    console.log(`  Name: "${input.name}"`);
    console.log(`  Role: ${input.role}`);
    console.log(`  Required: ${input.state.required}`);
  });
} catch (error) {
  console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
console.log();

// Example 5: Select elements that don't exist
console.log('═══ Example 5: Error Handling - No Matches ═══\n');
console.log('Selector: "video"\n');
try {
  const videoResults = buildAccessibilityTreeWithSelector(body, 'video');
  console.log(`Found ${videoResults.length} video element(s)`);
} catch (error) {
  if (error instanceof SelectorError) {
    console.log(`✓ Correctly caught SelectorError:`);
    console.log(`  ${error.message}`);
  } else {
    console.log(`Unexpected error: ${error}`);
  }
}
console.log();

// Example 6: Invalid selector syntax
console.log('═══ Example 6: Error Handling - Invalid Selector ═══\n');
console.log('Selector: "button[invalid"\n');
try {
  const invalidResults = buildAccessibilityTreeWithSelector(body, 'button[invalid');
  console.log(`Found ${invalidResults.length} element(s)`);
} catch (error) {
  if (error instanceof SelectorError) {
    console.log(`✓ Correctly caught SelectorError:`);
    console.log(`  ${error.message}`);
  } else {
    console.log(`Unexpected error: ${error}`);
  }
}
console.log();

// Example 7: Complex selector - buttons inside articles
console.log('═══ Example 7: Complex Selector - Buttons in Articles ═══\n');
console.log('Selector: "article button"\n');
try {
  const articleButtonResults = buildAccessibilityTreeWithSelector(body, 'article button');
  console.log(`Found ${articleButtonResults.length} button(s) inside articles\n`);
  articleButtonResults.forEach((result, i) => {
    console.log(`Button ${i + 1}: "${result.model.root.name}"`);
  });
} catch (error) {
  console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
console.log();

// Example 8: Multiple selectors
console.log('═══ Example 8: Multiple Selectors ═══\n');
console.log('Selector: "nav, aside"\n');
try {
  const multiResults = buildAccessibilityTreeWithSelector(body, 'nav, aside');
  console.log(`Found ${multiResults.length} element(s) (nav or aside)\n`);
  multiResults.forEach((result, i) => {
    console.log(`Element ${i + 1}:`);
    console.log(`  Role: ${result.model.root.role}`);
    console.log(`  Name: "${result.model.root.name}"`);
    console.log(`  Children: ${result.model.root.children.length}`);
  });
} catch (error) {
  console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
console.log();

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                              DEMO COMPLETE                                   ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
