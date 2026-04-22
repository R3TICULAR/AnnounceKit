export default function CommonMistakesPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Common Mistakes</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Common Mistakes</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Real-world HTML patterns that break screen reader experiences — and how to fix them.
          Each example shows the bad markup, what screen readers actually announce, and the
          corrected version.
        </p>
      </header>

      {MISTAKES.map((m) => (
        <section key={m.title} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-[18px]" aria-hidden="true">error</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{m.title}</h2>
          </div>
          <p className="text-slate-600 mb-6 leading-relaxed">{m.description}</p>

          {/* Bad example */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded">Bad</span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
              <div className="px-4 py-2 bg-red-900/20 border-b border-red-800/30">
                <span className="text-xs font-mono text-red-400 uppercase tracking-wider">HTML — Don&apos;t do this</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed text-red-300">{m.badHtml}</pre>
              </div>
            </div>
          </div>

          {/* What screen readers say */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
              <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">NVDA announces</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-amber-300">{m.badNvda}</pre>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
              <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">VoiceOver announces</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-amber-300">{m.badVoiceover}</pre>
              </div>
            </div>
          </div>

          {/* Why it's bad */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5 shrink-0" aria-hidden="true">warning</span>
              <span>{m.whyBad}</span>
            </p>
          </div>

          {/* Good example */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Fixed</span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
              <div className="px-4 py-2 bg-emerald-900/20 border-b border-emerald-800/30">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">HTML — Do this instead</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed text-emerald-300">{m.goodHtml}</pre>
              </div>
            </div>
          </div>

          {/* Fixed output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
              <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">NVDA now announces</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-green-400">{m.goodNvda}</pre>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
              <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">VoiceOver now announces</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono leading-relaxed text-green-400">{m.goodVoiceover}</pre>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Audit tip */}
      <section className="mb-16">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-teal-600 text-xl mt-0.5" aria-hidden="true">lightbulb</span>
            <div>
              <p className="text-sm font-semibold text-teal-900 mb-1">Catch these automatically</p>
              <p className="text-sm text-teal-800">
                Run <code className="font-mono text-xs bg-teal-100 px-1 py-0.5 rounded">speakable page.html -f audit</code> to
                detect many of these issues automatically. The audit report flags missing names,
                heading hierarchy violations, unnamed landmarks, and more — with specific
                remediation suggestions for each.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const MISTAKES: {
  title: string;
  description: string;
  badHtml: string;
  badNvda: string;
  badVoiceover: string;
  whyBad: string;
  goodHtml: string;
  goodNvda: string;
  goodVoiceover: string;
}[] = [
  {
    title: 'Button with no accessible name',
    description: 'Icon-only buttons without text or aria-label are announced as just "button" — users have no idea what it does.',
    badHtml: `<button>\n  <svg viewBox="0 0 24 24"><!-- icon --></svg>\n</button>`,
    badNvda: `"button"`,
    badVoiceover: `"button"`,
    whyBad: 'Screen readers announce "button" with no context. The user has to guess what this button does. This is one of the most common accessibility failures.',
    goodHtml: `<button aria-label="Close dialog">\n  <svg viewBox="0 0 24 24" aria-hidden="true"><!-- icon --></svg>\n</button>`,
    goodNvda: `"Close dialog, button"`,
    goodVoiceover: `"Close dialog, button"`,
  },
  {
    title: 'Skipped heading levels',
    description: 'Jumping from h1 to h3 breaks the document outline. Screen reader users navigate by heading level and expect a logical hierarchy.',
    badHtml: `<h1>Dashboard</h1>\n<h3>Recent Activity</h3>\n<h3>Settings</h3>`,
    badNvda: `"Dashboard, heading level 1\nRecent Activity, heading level 3\nSettings, heading level 3"`,
    badVoiceover: `"heading level 1, Dashboard\nheading level 3, Recent Activity\nheading level 3, Settings"`,
    whyBad: 'Users navigating by heading level will look for h2 and find nothing. The jump from h1 to h3 suggests missing content. Speakable\'s audit report flags this as an error.',
    goodHtml: `<h1>Dashboard</h1>\n<h2>Recent Activity</h2>\n<h2>Settings</h2>`,
    goodNvda: `"Dashboard, heading level 1\nRecent Activity, heading level 2\nSettings, heading level 2"`,
    goodVoiceover: `"heading level 1, Dashboard\nheading level 2, Recent Activity\nheading level 2, Settings"`,
  },
  {
    title: 'Duplicate landmarks without labels',
    description: 'Multiple nav elements without aria-label are indistinguishable to screen reader users.',
    badHtml: `<nav>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>\n<!-- ... page content ... -->\n<nav>\n  <a href="/privacy">Privacy</a>\n  <a href="/terms">Terms</a>\n</nav>`,
    badNvda: `"navigation landmark\n  Home, link\n  About, link\nnavigation landmark\n  Privacy, link\n  Terms, link"`,
    badVoiceover: `"navigation\n  Home, link\n  About, link\nnavigation\n  Privacy, link\n  Terms, link"`,
    whyBad: 'Both navs are announced identically. When a user opens the landmarks list, they see two "navigation" entries with no way to tell them apart.',
    goodHtml: `<nav aria-label="Main navigation">\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>\n<!-- ... page content ... -->\n<nav aria-label="Footer links">\n  <a href="/privacy">Privacy</a>\n  <a href="/terms">Terms</a>\n</nav>`,
    goodNvda: `"Main navigation, navigation landmark\n  Home, link\n  About, link\nFooter links, navigation landmark\n  Privacy, link\n  Terms, link"`,
    goodVoiceover: `"navigation, Main navigation\n  Home, link\n  About, link\nnavigation, Footer links\n  Privacy, link\n  Terms, link"`,
  },
  {
    title: 'Image without alt text',
    description: 'Images without alt attributes are announced with their filename or as just "image" — meaningless to screen reader users.',
    badHtml: `<img src="/images/team-photo.jpg" />`,
    badNvda: `"graphic"`,
    badVoiceover: `"image"`,
    whyBad: 'The user knows there\'s an image but has no idea what it shows. For informative images, always provide descriptive alt text. For decorative images, use alt="" to hide them from screen readers.',
    goodHtml: `<!-- Informative image -->\n<img src="/images/team-photo.jpg"\n  alt="The Speakable team at a conference booth" />\n\n<!-- Decorative image -->\n<img src="/images/divider.svg" alt="" />`,
    goodNvda: `"The Speakable team at a conference booth, graphic"`,
    goodVoiceover: `"The Speakable team at a conference booth, image"`,
  },
  {
    title: 'Form input without label',
    description: 'Inputs without associated labels are announced as just "edit" — users don\'t know what to type.',
    badHtml: `<input type="email" placeholder="Enter your email" />`,
    badNvda: `"edit"`,
    badVoiceover: `"edit text"`,
    whyBad: 'Placeholder text is not a substitute for a label. Most screen readers don\'t announce placeholder text as the accessible name. The input is effectively unlabeled.',
    goodHtml: `<label for="email">Email address</label>\n<input type="email" id="email"\n  placeholder="name@company.com" />`,
    goodNvda: `"Email address, edit"`,
    goodVoiceover: `"Email address, edit text"`,
  },
  {
    title: 'Div used as a button',
    description: 'Using a div with an onClick handler instead of a button element loses keyboard support, focus management, and role announcement.',
    badHtml: `<div class="btn" onclick="handleClick()">\n  Submit\n</div>`,
    badNvda: `"Submit"`,
    badVoiceover: `"Submit"`,
    whyBad: 'No "button" role is announced. The element isn\'t focusable via Tab. Keyboard users can\'t activate it with Enter or Space. Screen reader users don\'t know it\'s interactive.',
    goodHtml: `<button type="submit">\n  Submit\n</button>`,
    goodNvda: `"Submit, button"`,
    goodVoiceover: `"Submit, button"`,
  },
  {
    title: 'Link with no text',
    description: 'Links wrapping only an icon or image with no accessible name are announced as just "link" — users can\'t tell where it goes.',
    badHtml: `<a href="/settings">\n  <svg viewBox="0 0 24 24"><!-- gear icon --></svg>\n</a>`,
    badNvda: `"link"`,
    badVoiceover: `"link"`,
    whyBad: 'The link has no accessible name. Screen reader users hear "link" with no destination or purpose. This is especially common in icon-based navigation.',
    goodHtml: `<a href="/settings" aria-label="Settings">\n  <svg viewBox="0 0 24 24" aria-hidden="true"><!-- gear icon --></svg>\n</a>`,
    goodNvda: `"Settings, link"`,
    goodVoiceover: `"Settings, link"`,
  },
  {
    title: 'Redundant aria-label on a link',
    description: 'Adding aria-label that duplicates the visible text creates a confusing double announcement or hides the visible text from screen readers.',
    badHtml: `<a href="/pricing" aria-label="Click here to see pricing">\n  See Pricing\n</a>`,
    badNvda: `"Click here to see pricing, link"`,
    badVoiceover: `"Click here to see pricing, link"`,
    whyBad: 'The aria-label overrides the visible text. Sighted users see "See Pricing" but screen reader users hear "Click here to see pricing" — a mismatch that breaks the shared experience. Also, "click here" is not descriptive.',
    goodHtml: `<a href="/pricing">\n  See Pricing\n</a>`,
    goodNvda: `"See Pricing, link"`,
    goodVoiceover: `"See Pricing, link"`,
  },
  {
    title: 'Multiple h1 elements',
    description: 'Having more than one h1 on a page confuses the document structure. Screen reader users expect a single h1 as the page title.',
    badHtml: `<h1>Speakable</h1>\n<main>\n  <h1>Documentation</h1>\n  <p>Welcome to the docs.</p>\n</main>`,
    badNvda: `"Speakable, heading level 1\nDocumentation, heading level 1"`,
    badVoiceover: `"heading level 1, Speakable\nheading level 1, Documentation"`,
    whyBad: 'Two h1 elements suggest two separate pages or documents. Users navigating by heading can\'t determine which is the actual page title.',
    goodHtml: `<header>\n  <span class="logo">Speakable</span>\n</header>\n<main>\n  <h1>Documentation</h1>\n  <p>Welcome to the docs.</p>\n</main>`,
    goodNvda: `"Documentation, heading level 1"`,
    goodVoiceover: `"heading level 1, Documentation"`,
  },
  {
    title: 'Disabled button without accessible state',
    description: 'Using CSS to visually disable a button without the disabled attribute or aria-disabled means screen readers don\'t know it\'s inactive.',
    badHtml: `<button class="opacity-50 cursor-not-allowed">\n  Submit\n</button>`,
    badNvda: `"Submit, button"`,
    badVoiceover: `"Submit, button"`,
    whyBad: 'The button looks disabled visually but screen readers announce it as a normal, active button. Users will try to activate it and nothing will happen — with no explanation why.',
    goodHtml: `<button disabled>\n  Submit\n</button>`,
    goodNvda: `"Submit, button, unavailable"`,
    goodVoiceover: `"Submit, button, dimmed"`,
  },
];
