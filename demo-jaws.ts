/**
 * Demo: JAWS Renderer with Comparison to NVDA and VoiceOver
 * 
 * This demo shows JAWS-specific announcement patterns and highlights
 * the differences between JAWS, NVDA, and VoiceOver.
 */

import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from './src/extractor/index.js';
import { renderJAWS } from './src/renderer/jaws-renderer.js';
import { renderNVDA } from './src/renderer/nvda-renderer.js';
import { renderVoiceOver } from './src/renderer/voiceover-renderer.js';

console.log('='.repeat(80));
console.log('JAWS RENDERER DEMO');
console.log('='.repeat(80));
console.log();
console.log('Comparing JAWS, NVDA, and VoiceOver announcement patterns');
console.log();

// Example 1: Link announcement - JAWS uses "clickable"
console.log('Example 1: Link Announcement');
console.log('-'.repeat(80));

const linkHTML = '<a href="/home">Home</a>';
const linkDOM = new JSDOM(linkHTML);
const linkTree = buildAccessibilityTree(linkDOM.window.document.querySelector('a')!);

console.log('HTML:', linkHTML);
console.log();
console.log('JAWS:      ', renderJAWS(linkTree.model));
console.log('NVDA:      ', renderNVDA(linkTree.model));
console.log('VoiceOver: ', renderVoiceOver(linkTree.model));
console.log();
console.log('Key difference: JAWS uses "clickable" instead of "link"');
console.log();

// Example 2: Combobox - JAWS uses "combo box" (two words)
console.log('Example 2: Combobox Announcement');
console.log('-'.repeat(80));

const comboHTML = '<select aria-label="Country"><option>USA</option></select>';
const comboDOM = new JSDOM(comboHTML);
const comboTree = buildAccessibilityTree(comboDOM.window.document.querySelector('select')!);

console.log('HTML:', comboHTML);
console.log();
console.log('JAWS:      ', renderJAWS(comboTree.model));
console.log('NVDA:      ', renderNVDA(comboTree.model));
console.log('VoiceOver: ', renderVoiceOver(comboTree.model));
console.log();
console.log('Key difference: JAWS uses "combo box" (two words)');
console.log();

// Example 3: Checkbox - JAWS uses "check box" (two words)
console.log('Example 3: Checkbox Announcement');
console.log('-'.repeat(80));

const checkboxHTML = '<input type="checkbox" aria-label="Accept terms" />';
const checkboxDOM = new JSDOM(checkboxHTML);
const checkboxTree = buildAccessibilityTree(checkboxDOM.window.document.querySelector('input')!);

console.log('HTML:', checkboxHTML);
console.log();
console.log('JAWS:      ', renderJAWS(checkboxTree.model));
console.log('NVDA:      ', renderNVDA(checkboxTree.model));
console.log('VoiceOver: ', renderVoiceOver(checkboxTree.model));
console.log();
console.log('Key difference: JAWS uses "check box" (two words)');
console.log();

// Example 4: Mixed state checkbox - JAWS uses "partially checked"
console.log('Example 4: Mixed State Checkbox');
console.log('-'.repeat(80));

const mixedHTML = '<div role="checkbox" aria-checked="mixed" aria-label="Select all">Select all</div>';
const mixedDOM = new JSDOM(mixedHTML);
const mixedTree = buildAccessibilityTree(mixedDOM.window.document.querySelector('[role="checkbox"]')!);

console.log('HTML:', mixedHTML);
console.log();
console.log('JAWS:      ', renderJAWS(mixedTree.model));
console.log('NVDA:      ', renderNVDA(mixedTree.model));
console.log('VoiceOver: ', renderVoiceOver(mixedTree.model));
console.log();
console.log('Key difference: JAWS uses "partially checked", NVDA uses "half checked"');
console.log();

// Example 5: Radio button - JAWS uses "radio button"
console.log('Example 5: Radio Button Announcement');
console.log('-'.repeat(80));

const radioHTML = '<input type="radio" name="option" aria-label="Option A" checked />';
const radioDOM = new JSDOM(radioHTML);
const radioTree = buildAccessibilityTree(radioDOM.window.document.querySelector('input')!);

console.log('HTML:', radioHTML);
console.log();
console.log('JAWS:      ', renderJAWS(radioTree.model));
console.log('NVDA:      ', renderNVDA(radioTree.model));
console.log('VoiceOver: ', renderVoiceOver(radioTree.model));
console.log();
console.log('Key difference: JAWS uses "radio button" (two words)');
console.log();

// Example 6: Invalid input - JAWS uses "invalid entry"
console.log('Example 6: Invalid Input Announcement');
console.log('-'.repeat(80));

const invalidHTML = '<input type="email" aria-label="Email" aria-invalid="true" />';
const invalidDOM = new JSDOM(invalidHTML);
const invalidTree = buildAccessibilityTree(invalidDOM.window.document.querySelector('input')!);

console.log('HTML:', invalidHTML);
console.log();
console.log('JAWS:      ', renderJAWS(invalidTree.model));
console.log('NVDA:      ', renderNVDA(invalidTree.model));
console.log('VoiceOver: ', renderVoiceOver(invalidTree.model));
console.log();
console.log('Key difference: JAWS uses "invalid entry"');
console.log();

// Example 7: Disabled button - JAWS uses "unavailable"
console.log('Example 7: Disabled Button Announcement');
console.log('-'.repeat(80));

const disabledHTML = '<button disabled>Submit</button>';
const disabledDOM = new JSDOM(disabledHTML);
const disabledTree = buildAccessibilityTree(disabledDOM.window.document.querySelector('button')!);

console.log('HTML:', disabledHTML);
console.log();
console.log('JAWS:      ', renderJAWS(disabledTree.model));
console.log('NVDA:      ', renderNVDA(disabledTree.model));
console.log('VoiceOver: ', renderVoiceOver(disabledTree.model));
console.log();
console.log('Key difference: All use "unavailable" or "dimmed" for disabled state');
console.log();

// Example 8: Navigation landmark
console.log('Example 8: Navigation Landmark');
console.log('-'.repeat(80));

const navHTML = '<nav aria-label="Main navigation"><a href="/">Home</a></nav>';
const navDOM = new JSDOM(navHTML);
const navTree = buildAccessibilityTree(navDOM.window.document.querySelector('nav')!);

console.log('HTML:', navHTML);
console.log();
console.log('JAWS:      ', renderJAWS(navTree.model));
console.log('NVDA:      ', renderNVDA(navTree.model));
console.log('VoiceOver: ', renderVoiceOver(navTree.model));
console.log();
console.log('Key difference: JAWS uses "navigation region", VoiceOver announces role first');
console.log();

// Example 9: Heading with level
console.log('Example 9: Heading Announcement');
console.log('-'.repeat(80));

const headingHTML = '<h1>Welcome</h1>';
const headingDOM = new JSDOM(headingHTML);
const headingTree = buildAccessibilityTree(headingDOM.window.document.querySelector('h1')!);

console.log('HTML:', headingHTML);
console.log();
console.log('JAWS:      ', renderJAWS(headingTree.model));
console.log('NVDA:      ', renderNVDA(headingTree.model));
console.log('VoiceOver: ', renderVoiceOver(headingTree.model));
console.log();
console.log('Key difference: VoiceOver announces role first for headings');
console.log();

// Example 10: Complex form with multiple elements
console.log('Example 10: Complex Form');
console.log('-'.repeat(80));

const formHTML = `
  <form>
    <label for="username">Username</label>
    <input type="text" id="username" required />
    <button type="submit">Submit</button>
  </form>
`;
const formDOM = new JSDOM(formHTML);
const formTree = buildAccessibilityTree(formDOM.window.document.querySelector('form')!);

console.log('HTML:', formHTML.trim());
console.log();
console.log('JAWS:');
console.log(renderJAWS(formTree.model).split('\n').map(line => '  ' + line).join('\n'));
console.log();
console.log('NVDA:');
console.log(renderNVDA(formTree.model).split('\n').map(line => '  ' + line).join('\n'));
console.log();
console.log('VoiceOver:');
console.log(renderVoiceOver(formTree.model).split('\n').map(line => '  ' + line).join('\n'));
console.log();

console.log('='.repeat(80));
console.log('SUMMARY OF KEY JAWS DIFFERENCES');
console.log('='.repeat(80));
console.log();
console.log('Terminology Differences:');
console.log('  • Links: "clickable" (JAWS) vs "link" (NVDA/VoiceOver)');
console.log('  • Combobox: "combo box" (JAWS) vs "combobox" (NVDA/VoiceOver)');
console.log('  • Checkbox: "check box" (JAWS) vs "checkbox" (NVDA/VoiceOver)');
console.log('  • Radio: "radio button" (JAWS) vs "radio" (NVDA/VoiceOver)');
console.log('  • Mixed state: "partially checked" (JAWS) vs "half checked" (NVDA)');
console.log('  • Invalid: "invalid entry" (JAWS) vs "invalid" (NVDA/VoiceOver)');
console.log();
console.log('Announcement Order:');
console.log('  • JAWS/NVDA: Name → Role → State');
console.log('  • VoiceOver: Role → Name → State (for headings/landmarks)');
console.log();
console.log('Note: These are heuristic approximations. Real screen reader behavior');
console.log('varies by version, settings, verbosity level, and context.');
console.log();
