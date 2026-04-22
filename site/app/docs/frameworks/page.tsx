export default function FrameworkGuidesPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Framework Guides</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Framework Guides</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Integrate Speakable into your React, Angular, Svelte, or Web Component workflow.
          Each guide shows how to extract rendered HTML from your components and
          feed it into Speakable for screen reader simulation.
        </p>
      </header>

      {/* React */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">⚛</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">React</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">@testing-library/react</code> to
          render components, then pass the HTML to Speakable for analysis.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Unit test integration</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Render your component in a test, extract the HTML, and run Speakable programmatically:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">button.a11y.test.tsx</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { render } from '@testing-library/react';
import { parseHTML, buildAccessibilityTree, renderNVDA } from '@reticular/speakable';
import { SubmitButton } from './SubmitButton';

test('button announces correctly for NVDA', () => {
  const { container } = render(<SubmitButton label="Place Order" />);
  const html = container.innerHTML;

  const doc = parseHTML(html);
  const { model } = buildAccessibilityTree(doc.document.body);
  const output = renderNVDA(model);

  expect(output).toContain('Place Order, button');
});`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Storybook integration</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Export rendered HTML from Storybook stories and analyze with the CLI:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Build Storybook static HTML, then analyze</span>{'\n'}
                <span className="text-blue-400">npx</span>{' '}
                <span className="text-emerald-400">storybook build</span>{' '}
                <span className="text-orange-300">-o storybook-static</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">storybook-static/iframe.html</span>{' '}
                <span className="text-orange-300">--selector &quot;.sb-show-main&quot; -f audit</span>
              </code>
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Next.js pages</h3>
        <p className="text-slate-600 mb-4 text-sm">
          For Next.js, build the site and analyze the static HTML output:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">next build</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">out/index.html</span>{' '}
                <span className="text-orange-300">-f audit -s all</span>{'\n\n'}
                <span className="text-slate-500"># Analyze a specific page</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">out/pricing.html</span>{' '}
                <span className="text-orange-300">--selector &quot;main&quot; -f text</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Angular */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
            <span className="text-red-600 font-bold text-sm">A</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Angular</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use Angular&apos;s <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">TestBed</code> to
          render components, then extract the native element HTML for analysis.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Component test integration</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">button.a11y.spec.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { TestBed } from '@angular/core/testing';
import { parseHTML, buildAccessibilityTree, renderNVDA } from '@reticular/speakable';
import { SubmitButtonComponent } from './submit-button.component';

describe('SubmitButton a11y', () => {
  it('announces correctly for NVDA', () => {
    TestBed.configureTestingModule({
      declarations: [SubmitButtonComponent]
    });
    const fixture = TestBed.createComponent(SubmitButtonComponent);
    fixture.componentInstance.label = 'Place Order';
    fixture.detectChanges();

    const html = fixture.nativeElement.innerHTML;
    const doc = parseHTML(html);
    const { model } = buildAccessibilityTree(doc.document.body);
    const output = renderNVDA(model);

    expect(output).toContain('Place Order, button');
  });
});`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Build output analysis</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-blue-400">ng build</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">dist/my-app/browser/index.html</span>{' '}
                <span className="text-orange-300">-f audit</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Svelte */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-sm">S</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Svelte</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">@testing-library/svelte</code> to
          render components, then pass the HTML to Speakable. For SvelteKit apps, analyze the
          static adapter output directly.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Component test integration</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Render your Svelte component in a test and extract the HTML for analysis:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">SubmitButton.a11y.test.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { render } from '@testing-library/svelte';
import { parseHTML, buildAccessibilityTree, renderNVDA, renderVoiceOver } from '@reticular/speakable';
import SubmitButton from './SubmitButton.svelte';

test('button announces correctly for NVDA', () => {
  const { container } = render(SubmitButton, {
    props: { label: 'Place Order' }
  });
  const html = container.innerHTML;

  const doc = parseHTML(html);
  const { model } = buildAccessibilityTree(doc.document.body);

  expect(renderNVDA(model)).toContain('Place Order, button');
});

test('VoiceOver announces role first for landmarks', () => {
  const { container } = render(NavBar, {
    props: { label: 'Main' }
  });
  const doc = parseHTML(container.innerHTML);
  const { model } = buildAccessibilityTree(doc.document.body);

  // VoiceOver puts role before name for landmarks
  expect(renderVoiceOver(model)).toContain('navigation, Main');
});`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">SvelteKit static output</h3>
        <p className="text-slate-600 mb-4 text-sm">
          If you&apos;re using SvelteKit with the static adapter, analyze the build output directly:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Build with static adapter</span>{'\n'}
                <span className="text-blue-400">npm run build</span>{'\n\n'}
                <span className="text-slate-500"># Analyze the generated pages</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">build/index.html</span>{' '}
                <span className="text-orange-300">-f audit -s all</span>{'\n\n'}
                <span className="text-slate-500"># Analyze a specific route</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">build/about/index.html</span>{' '}
                <span className="text-orange-300">--selector &quot;main&quot; -f text</span>{'\n\n'}
                <span className="text-slate-500"># Batch analyze all pages</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-orange-300">--batch</span>{' '}
                <span className="text-emerald-400">build/**/index.html</span>{' '}
                <span className="text-orange-300">-f audit</span>
              </code>
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Svelte 5 with runes</h3>
        <p className="text-slate-600 mb-4 text-sm">
          The same pattern works with Svelte 5 — the testing library renders the component
          to DOM regardless of whether you use runes or legacy syntax:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Dialog.a11y.test.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { render } from '@testing-library/svelte';
import { parseHTML, buildAccessibilityTree, renderNVDA } from '@reticular/speakable';
import Dialog from './Dialog.svelte';

test('dialog announces with title and description', () => {
  const { container } = render(Dialog, {
    props: {
      open: true,
      title: 'Delete account?',
      description: 'This cannot be undone.'
    }
  });

  const doc = parseHTML(container.innerHTML);
  const { model } = buildAccessibilityTree(doc.document.body);
  const output = renderNVDA(model);

  expect(output).toContain('Delete account?, dialog');
  expect(output).toContain('This cannot be undone.');
});`}
            </pre>
          </div>
        </div>
      </section>

      {/* Web Components */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center">
            <span className="text-teal-600 font-bold text-sm">WC</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Web Components</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Web Components render to the light DOM or shadow DOM. Speakable analyzes the
          light DOM output — extract <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">innerHTML</code> or
          use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">shadowRoot.innerHTML</code> for
          shadow DOM components.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Lit component testing</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">my-button.a11y.test.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { fixture, html } from '@open-wc/testing';
import { parseHTML, buildAccessibilityTree, renderNVDA } from '@reticular/speakable';
import './my-button.js';

it('announces correctly', async () => {
  const el = await fixture(html\`<my-button label="Submit"></my-button>\`);

  // For light DOM components
  const output = el.innerHTML;

  // For shadow DOM components
  // const output = el.shadowRoot.innerHTML;

  const doc = parseHTML(output);
  const { model } = buildAccessibilityTree(doc.document.body);
  expect(renderNVDA(model)).toContain('Submit, button');
});`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Vanilla Web Components</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">test.js</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { parseHTML, buildAccessibilityTree, renderVoiceOver } from '@reticular/speakable';

// Create and render the component
const el = document.createElement('my-dialog');
el.setAttribute('open', '');
el.innerHTML = '<h2>Confirm</h2><button>OK</button>';
document.body.appendChild(el);

// Analyze
const doc = parseHTML(el.outerHTML);
const { model } = buildAccessibilityTree(doc.document.body);
console.log(renderVoiceOver(model));
// "web dialog\n  heading level 2, Confirm\n  OK, button"`}
            </pre>
          </div>
        </div>
      </section>

      {/* General pattern */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">General Pattern</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Regardless of framework, the integration pattern is the same:
        </p>
        <ol className="list-decimal list-inside space-y-3 text-slate-600 mb-6">
          <li>Render your component to HTML (via test harness, build output, or DOM API)</li>
          <li>Pass the HTML string to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">parseHTML()</code></li>
          <li>Build the accessibility tree with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">buildAccessibilityTree()</code></li>
          <li>Render with your target screen reader (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">renderNVDA</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">renderJAWS</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">renderVoiceOver</code>)</li>
          <li>Assert against expected output or save as a baseline for regression detection</li>
        </ol>
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
          <p className="text-sm text-teal-800">
            The CLI works with any static HTML file. If your framework produces HTML output
            (SSG, SSR, or build artifacts), you can analyze it directly without writing any
            integration code: <code className="font-mono text-xs">speakable dist/index.html -f audit</code>
          </p>
        </div>
      </section>
    </>
  );
}
