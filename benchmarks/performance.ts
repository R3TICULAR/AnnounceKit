/**
 * Performance benchmarks for Speakable.
 * Target: <5 seconds for typical component HTML.
 * Alert threshold: >20% regression from baseline.
 */

import { parseHTML } from '../src/parser/index.js';
import { buildAccessibilityTree } from '../src/extractor/index.js';
import { serializeModel } from '../src/model/serialization.js';

// --- Fixtures ---

const SIMPLE_BUTTON = `<button aria-expanded="false">Show menu</button>`;

const FORM_COMPONENT = `
<form>
  <label for="name">Full name</label>
  <input id="name" type="text" required>
  <label for="email">Email</label>
  <input id="email" type="email" required aria-invalid="false">
  <label for="message">Message</label>
  <textarea id="message" rows="4"></textarea>
  <button type="submit">Send message</button>
</form>`;

const NAV_COMPONENT = `
<nav aria-label="Main navigation">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/services">Services</a>
  <a href="/blog">Blog</a>
  <a href="/contact">Contact</a>
</nav>`;

// Generates a large document with many accessible elements
function generateLargeDocument(itemCount: number): string {
  const items = Array.from({ length: itemCount }, (_, i) => `
    <article>
      <h2>Article ${i + 1}</h2>
      <p>Content for article ${i + 1}.</p>
      <a href="/article-${i + 1}">Read more</a>
      <button aria-label="Save article ${i + 1}">Save</button>
    </article>
  `).join('');

  return `
    <main>
      <h1>Articles</h1>
      <nav aria-label="Pagination">
        <a href="?page=1">1</a>
        <a href="?page=2">2</a>
      </nav>
      ${items}
    </main>`;
}

// --- Benchmark runner ---

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  passed: boolean;
}

function benchmark(
  name: string,
  fn: () => void,
  iterations = 100,
  thresholdMs = 5000
): BenchmarkResult {
  const times: number[] = [];

  // Warm up
  for (let i = 0; i < 5; i++) fn();

  // Measure
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  const totalMs = times.reduce((a, b) => a + b, 0);
  const avgMs = totalMs / iterations;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);

  return {
    name,
    iterations,
    totalMs,
    avgMs,
    minMs,
    maxMs,
    passed: avgMs < thresholdMs,
  };
}

// --- Run benchmarks ---

function runAll(): void {
  console.log('Speakable Performance Benchmarks');
  console.log('===================================\n');

  const results: BenchmarkResult[] = [];

  // Simple button
  results.push(benchmark('Simple button (parse + extract)', () => {
    const doc = parseHTML(SIMPLE_BUTTON);
    buildAccessibilityTree(doc.document.body);
  }));

  // Form component
  results.push(benchmark('Form component (parse + extract)', () => {
    const doc = parseHTML(FORM_COMPONENT);
    buildAccessibilityTree(doc.document.body);
  }));

  // Navigation component
  results.push(benchmark('Navigation component (parse + extract)', () => {
    const doc = parseHTML(NAV_COMPONENT);
    buildAccessibilityTree(doc.document.body);
  }));

  // Full pipeline with serialization
  results.push(benchmark('Form component (full pipeline)', () => {
    const doc = parseHTML(FORM_COMPONENT);
    const result = buildAccessibilityTree(doc.document.body);
    serializeModel(result.model);
  }));

  // Large document (50 articles)
  const largeDoc = generateLargeDocument(50);
  results.push(benchmark('Large document 50 articles (parse + extract)', () => {
    const doc = parseHTML(largeDoc);
    buildAccessibilityTree(doc.document.body);
  }, 20, 5000));

  // Print results
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? '✓' : '✗';
    const avgFormatted = r.avgMs.toFixed(3);
    const minFormatted = r.minMs.toFixed(3);
    const maxFormatted = r.maxMs.toFixed(3);

    console.log(`${status} ${r.name}`);
    console.log(`  avg: ${avgFormatted}ms  min: ${minFormatted}ms  max: ${maxFormatted}ms  (${r.iterations} iterations)`);
    console.log();

    if (!r.passed) allPassed = false;
  }

  console.log('===================================');
  if (allPassed) {
    console.log('All benchmarks passed.');
  } else {
    console.error('Some benchmarks exceeded thresholds.');
    process.exit(1);
  }
}

runAll();
