export default function SpecIntegrationPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Spec Integration</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Spec Integration
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Define expected screen reader output in your specs before writing code.
          Speakable lets you validate that your implementation matches the intended
          accessibility behavior from day one.
        </p>
      </header>

      {/* Why spec-first */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why define accessibility in specs?</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Most accessibility issues are caught late — during QA, audits, or user complaints.
          By defining expected screen reader output in your component specs, you shift
          detection to the earliest possible point: before the code is written.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Catch issues at design time</h3>
            <p className="text-xs text-slate-500">
              If you can&apos;t describe what a screen reader should say, the component
              likely has an accessibility gap.
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Shared understanding</h3>
            <p className="text-xs text-slate-500">
              Specs with screen reader output give designers, developers, and QA a
              concrete definition of &ldquo;accessible.&rdquo;
            </p>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Automated validation</h3>
            <p className="text-xs text-slate-500">
              Expected output becomes a test assertion. Regressions are caught
              automatically in CI.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">The spec-first workflow</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          This workflow integrates Speakable into your development process from the
          beginning — not as an afterthought.
        </p>
        <div className="space-y-6">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spec file format */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Writing accessibility specs</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          An accessibility spec defines the expected screen reader output for a component.
          You can write these as JSON files, markdown tables, or inline test assertions.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">JSON spec format</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Define expected output for each screen reader alongside the HTML input:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">submit-button.a11y-spec.json</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`{
  "component": "SubmitButton",
  "html": "<button type=\\"submit\\" aria-label=\\"Place order\\">Pay $49.99</button>",
  "expected": {
    "nvda": "Place order, button",
    "jaws": "Place order, button",
    "voiceover": "Place order, button"
  },
  "states": [
    {
      "name": "disabled",
      "html": "<button type=\\"submit\\" aria-label=\\"Place order\\" disabled>Pay $49.99</button>",
      "expected": {
        "nvda": "Place order, button, unavailable",
        "jaws": "Place order, button, unavailable",
        "voiceover": "Place order, button, dimmed"
      }
    },
    {
      "name": "loading",
      "html": "<button type=\\"submit\\" aria-label=\\"Place order\\" aria-busy=\\"true\\">Processing...</button>",
      "expected": {
        "nvda": "Place order, button, busy",
        "voiceover": "Place order, button, busy"
      }
    }
  ]
}`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">Markdown spec format</h3>
        <p className="text-slate-600 mb-4 text-sm">
          For design docs and PRDs, use a table format that&apos;s readable by non-developers:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">submit-button.spec.md</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`## SubmitButton — Accessibility Spec

### Default state
| Reader     | Expected Output              |
|------------|------------------------------|
| NVDA       | "Place order, button"        |
| JAWS       | "Place order, button"        |
| VoiceOver  | "Place order, button"        |

### Disabled state
| Reader     | Expected Output                        |
|------------|----------------------------------------|
| NVDA       | "Place order, button, unavailable"     |
| JAWS       | "Place order, button, unavailable"     |
| VoiceOver  | "Place order, button, dimmed"          |

### Notes
- Button uses aria-label to override visible text
- Disabled state uses native disabled attribute
- VoiceOver says "dimmed" instead of "unavailable"`}
            </pre>
          </div>
        </div>
      </section>

      {/* Test assertions */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Validating specs in tests</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Turn your specs into automated tests. Each assertion validates that the
          rendered component matches the expected screen reader output.
        </p>

        <h3 className="text-lg font-bold text-slate-900 mb-3">React + Vitest</h3>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">submit-button.a11y.test.tsx</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`import { render } from '@testing-library/react';
import { parseHTML, buildAccessibilityTree, renderNVDA, renderVoiceOver } from '@reticular/speakable';
import { SubmitButton } from './SubmitButton';
import spec from './submit-button.a11y-spec.json';

describe('SubmitButton accessibility spec', () => {
  function getOutput(html: string) {
    const doc = parseHTML(html);
    const { model } = buildAccessibilityTree(doc.document.body);
    return {
      nvda: renderNVDA(model),
      voiceover: renderVoiceOver(model),
    };
  }

  it('default state matches spec', () => {
    const { container } = render(<SubmitButton label="Place order" price="$49.99" />);
    const output = getOutput(container.innerHTML);
    expect(output.nvda).toContain(spec.expected.nvda);
    expect(output.voiceover).toContain(spec.expected.voiceover);
  });

  it('disabled state matches spec', () => {
    const { container } = render(<SubmitButton label="Place order" price="$49.99" disabled />);
    const output = getOutput(container.innerHTML);
    const disabledSpec = spec.states.find(s => s.name === 'disabled')!;
    expect(output.nvda).toContain(disabledSpec.expected.nvda);
    expect(output.voiceover).toContain(disabledSpec.expected.voiceover);
  });
});`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">CLI-based validation</h3>
        <p className="text-slate-600 mb-4 text-sm">
          For simpler workflows, validate specs using the CLI and diff mode:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-slate-500"># Save the spec baseline from your expected HTML</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">spec/submit-button.html</span>{' '}
                <span className="text-orange-300">-f json -o spec/submit-button.baseline.json</span>{'\n\n'}
                <span className="text-slate-500"># After implementation, compare against the spec</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">dist/submit-button.html</span>{' '}
                <span className="text-orange-300">--diff spec/submit-button.html</span>{'\n\n'}
                <span className="text-slate-500"># In CI — fail if output doesn&apos;t match spec</span>{'\n'}
                <span className="text-blue-400">speakable</span>{' '}
                <span className="text-emerald-400">dist/submit-button.html</span>{' '}
                <span className="text-orange-300">--diff spec/submit-button.html</span>{' '}
                <span className="text-slate-300">||</span>{' '}
                <span className="text-slate-300">exit 1</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Real-world examples */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Real-world spec examples</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Here are accessibility specs for common UI patterns. Use these as templates
          for your own components.
        </p>

        {SPEC_EXAMPLES.map((ex) => (
          <div key={ex.title} className="mb-10">
            <h3 className="text-lg font-bold text-slate-900 mb-3">{ex.title}</h3>
            <p className="text-slate-600 mb-4 text-sm">{ex.description}</p>
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-3">
              <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed text-blue-400">{ex.html}</pre>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">NVDA</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed text-green-400">{ex.nvda}</pre>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">VoiceOver</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed text-purple-400">{ex.voiceover}</pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Tips */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tips for writing good specs</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-teal-500 font-bold text-lg leading-tight">1.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Spec every interactive state</p>
              <p className="text-slate-600 text-sm">Default, hover, focus, disabled, loading, error — each state may produce different screen reader output.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-teal-500 font-bold text-lg leading-tight">2.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Include all three readers</p>
              <p className="text-slate-600 text-sm">NVDA, JAWS, and VoiceOver announce differently. A spec that only covers one reader misses cross-platform issues.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-teal-500 font-bold text-lg leading-tight">3.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Write specs before code</p>
              <p className="text-slate-600 text-sm">If you can&apos;t describe what the screen reader should say, the design likely needs accessibility review.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-teal-500 font-bold text-lg leading-tight">4.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Store specs alongside components</p>
              <p className="text-slate-600 text-sm">Keep <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">.a11y-spec.json</code> files next to your component source for easy discovery and maintenance.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-teal-500 font-bold text-lg leading-tight">5.</span>
            <div>
              <p className="text-slate-900 font-semibold text-sm">Use the web analyzer for drafting</p>
              <p className="text-slate-600 text-sm">
                Paste your expected HTML into{' '}
                <a href="https://getspeakable.dev/tool" className="text-blue-600 hover:underline">getspeakable.dev/tool</a>{' '}
                to quickly see what each reader would say, then copy the output into your spec.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const WORKFLOW_STEPS = [
  {
    title: 'Define expected output in the spec',
    description: 'Before writing any component code, document what each screen reader should announce for every state (default, disabled, expanded, error, etc.).',
  },
  {
    title: 'Write the HTML/component',
    description: 'Implement the component with the ARIA attributes and semantic HTML needed to produce the expected output.',
  },
  {
    title: 'Validate with Speakable',
    description: 'Run the component HTML through Speakable and compare the actual output against the spec. Fix any mismatches.',
  },
  {
    title: 'Save as baseline',
    description: 'Once the output matches the spec, save the JSON model as a baseline for regression detection.',
  },
  {
    title: 'Automate in CI',
    description: 'Add a CI step that diffs the current output against the baseline. Any unintended changes fail the build.',
  },
];

const SPEC_EXAMPLES = [
  {
    title: 'Modal dialog',
    description: 'A dialog with a heading, description, and action buttons.',
    html: `<div role="dialog" aria-labelledby="title" aria-describedby="desc">\n  <h2 id="title">Delete account?</h2>\n  <p id="desc">This action cannot be undone.</p>\n  <button>Cancel</button>\n  <button>Delete</button>\n</div>`,
    nvda: `"Delete account?, dialog\n  Delete account?, heading level 2\n  This action cannot be undone.\n  Cancel, button\n  Delete, button"`,
    voiceover: `"web dialog, Delete account?\n  heading level 2, Delete account?\n  This action cannot be undone.\n  Cancel, button\n  Delete, button"`,
  },
  {
    title: 'Accordion',
    description: 'An expandable section with aria-expanded toggle.',
    html: `<button aria-expanded="false" aria-controls="panel1">Shipping info</button>\n<div id="panel1" hidden>\n  <p>Free shipping on orders over $50.</p>\n</div>`,
    nvda: `"Shipping info, button, collapsed"`,
    voiceover: `"Shipping info, button, collapsed"`,
  },
  {
    title: 'Search with combobox',
    description: 'A search input with autocomplete suggestions.',
    html: `<label for="search">Search products</label>\n<input id="search" type="text" role="combobox"\n  aria-expanded="false" aria-autocomplete="list"\n  aria-controls="results" />`,
    nvda: `"Search products, combo box, collapsed"`,
    voiceover: `"Search products, combo box, collapsed"`,
  },
  {
    title: 'Navigation with current page',
    description: 'A nav landmark with aria-current indicating the active page.',
    html: `<nav aria-label="Main">\n  <a href="/" aria-current="page">Home</a>\n  <a href="/products">Products</a>\n  <a href="/about">About</a>\n</nav>`,
    nvda: `"Main, navigation landmark\n  Home, link, current page\n  Products, link\n  About, link"`,
    voiceover: `"navigation, Main\n  Home, link, current page\n  Products, link\n  About, link"`,
  },
  {
    title: 'Form with validation errors',
    description: 'An input with aria-invalid and an error message linked via aria-describedby.',
    html: `<label for="email">Email</label>\n<input id="email" type="email" aria-invalid="true"\n  aria-describedby="err" required />\n<span id="err">Please enter a valid email address</span>`,
    nvda: `"Email, edit, invalid entry, required,\n  Please enter a valid email address"`,
    voiceover: `"Email, edit text, invalid data, required,\n  Please enter a valid email address"`,
  },
];
