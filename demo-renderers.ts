/**
 * Demo script comparing NVDA and VoiceOver renderers side-by-side.
 * 
 * Run with: npx tsx demo-renderers.ts
 */

import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from './src/extractor/tree-builder.js';
import { renderNVDA } from './src/renderer/nvda-renderer.js';
import { renderVoiceOver } from './src/renderer/voiceover-renderer.js';

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    NVDA vs VOICEOVER COMPARISON                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

function compareRenderers(title: string, html: string) {
  console.log(`═══ ${title} ═══\n`);
  console.log('HTML:', html.trim());
  console.log();
  
  const dom = new JSDOM(html);
  const element = dom.window.document.body.firstElementChild!;
  const result = buildAccessibilityTree(element);
  
  const nvda = renderNVDA(result.model);
  const voiceover = renderVoiceOver(result.model);
  
  console.log('NVDA announces:');
  console.log(nvda);
  console.log();
  console.log('VoiceOver announces:');
  console.log(voiceover);
  console.log();
  
  // Highlight differences
  if (nvda !== voiceover) {
    console.log('📝 Key differences:');
    if (nvda.includes('not checked') && voiceover.includes('unchecked')) {
      console.log('  • Checkbox: NVDA says "not checked", VoiceOver says "unchecked"');
    }
    if (nvda.includes('unavailable') && voiceover.includes('dimmed')) {
      console.log('  • Disabled: NVDA says "unavailable", VoiceOver says "dimmed"');
    }
    if (nvda.includes(', edit,') && voiceover.includes('edit text')) {
      console.log('  • Textbox: NVDA says "edit", VoiceOver says "edit text"');
    }
    if (nvda.includes('graphic') && voiceover.includes('image')) {
      console.log('  • Image: NVDA says "graphic", VoiceOver says "image"');
    }
    if (nvda.includes('list item') && voiceover.includes(', item')) {
      console.log('  • List item: NVDA says "list item", VoiceOver says "item"');
    }
    if (nvda.includes('heading level') && voiceover.includes('heading level')) {
      const nvdaOrder = nvda.indexOf('heading level') < nvda.indexOf(',');
      const voOrder = voiceover.indexOf('heading level') < voiceover.indexOf(',');
      if (nvdaOrder !== voOrder) {
        console.log('  • Heading: NVDA announces name first, VoiceOver announces role first');
      }
    }
    console.log();
  }
}

// Example 1: Simple button
compareRenderers('Example 1: Simple Button', '<button>Click me</button>');

// Example 2: Heading (role order difference)
compareRenderers('Example 2: Heading', '<h2>Section Title</h2>');

// Example 3: Unchecked checkbox
compareRenderers('Example 3: Unchecked Checkbox', '<input type="checkbox" aria-label="Accept terms">');

// Example 4: Disabled button
compareRenderers('Example 4: Disabled Button', '<button disabled>Submit</button>');

// Example 5: Textbox
compareRenderers('Example 5: Textbox', '<input type="text" aria-label="Name">');

// Example 6: Image
compareRenderers('Example 6: Image', '<img src="logo.png" alt="Company Logo">');

// Example 7: List
compareRenderers('Example 7: List', `
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>
`);

// Example 8: Navigation landmark
compareRenderers('Example 8: Navigation Landmark', '<nav aria-label="Main navigation"></nav>');

// Example 9: Complex form
compareRenderers('Example 9: Form with Validation', `
<form>
  <label for="email">Email</label>
  <input type="email" id="email" required aria-invalid="true">
  <button type="submit">Submit</button>
</form>
`);

// Example 10: Accordion
compareRenderers('Example 10: Accordion', `
<div>
  <button aria-expanded="false">Section 1</button>
  <div role="region">Content</div>
</div>
`);

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                         COMPARISON COMPLETE                                  ║');
console.log('║                                                                              ║');
console.log('║  Summary of Key Differences:                                                 ║');
console.log('║                                                                              ║');
console.log('║  1. Checkbox states:                                                         ║');
console.log('║     • NVDA: "not checked" / "half checked"                                   ║');
console.log('║     • VoiceOver: "unchecked" / "mixed"                                       ║');
console.log('║                                                                              ║');
console.log('║  2. Disabled elements:                                                       ║');
console.log('║     • NVDA: "unavailable"                                                    ║');
console.log('║     • VoiceOver: "dimmed"                                                    ║');
console.log('║                                                                              ║');
console.log('║  3. Textbox role:                                                            ║');
console.log('║     • NVDA: "edit"                                                           ║');
console.log('║     • VoiceOver: "edit text"                                                 ║');
console.log('║                                                                              ║');
console.log('║  4. Images:                                                                  ║');
console.log('║     • NVDA: "graphic"                                                        ║');
console.log('║     • VoiceOver: "image"                                                     ║');
console.log('║                                                                              ║');
console.log('║  5. List items:                                                              ║');
console.log('║     • NVDA: "list item"                                                      ║');
console.log('║     • VoiceOver: "item"                                                      ║');
console.log('║                                                                              ║');
console.log('║  6. Announcement order:                                                      ║');
console.log('║     • NVDA: Usually name first, then role                                    ║');
console.log('║     • VoiceOver: Role first for headings and landmarks                       ║');
console.log('║                                                                              ║');
console.log('║  Note: These are heuristic approximations. Real behavior varies.            ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
