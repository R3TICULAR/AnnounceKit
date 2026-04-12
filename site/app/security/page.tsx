import Link from 'next/link';

export default function SecurityPage() {
  return (
    <div className="max-w-3xl mx-auto pt-12 pb-24 px-6">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Security</h1>
        <p className="text-slate-500">How Speakable protects your data and code</p>
      </header>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <span className="material-symbols-outlined" aria-hidden="true">shield</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Your code stays on your machine</h2>
                <p className="text-slate-600">
                  The Speakable CLI runs entirely locally. Your HTML, source code, and analysis
                  results never leave your machine or CI/CD environment. There is no telemetry,
                  no cloud processing, and no data transmission.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-blue-600" aria-hidden="true">terminal</span>
                <h3 className="font-bold text-slate-900">CLI Tool</h3>
              </div>
              <p className="text-sm text-slate-600">
                Runs locally via Node.js. Parses HTML with jsdom, builds accessibility trees,
                and renders output — all in-process with zero network calls.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-blue-600" aria-hidden="true">language</span>
                <h3 className="font-bold text-slate-900">Web Analyzer</h3>
              </div>
              <p className="text-sm text-slate-600">
                Runs entirely in the browser. HTML you paste is processed client-side using
                the browser&apos;s native DOM parser. Nothing is sent to our servers.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-teal-600" aria-hidden="true">lock</span>
                <h3 className="font-bold text-slate-900">Authentication</h3>
              </div>
              <p className="text-sm text-slate-600">
                Handled by Clerk with industry-standard OAuth 2.0, session management,
                and optional multi-factor authentication.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-teal-600" aria-hidden="true">payments</span>
                <h3 className="font-bold text-slate-900">Payments</h3>
              </div>
              <p className="text-sm text-slate-600">
                Processed by Stripe. We never handle or store credit card numbers.
                All payment data is encrypted in transit and at rest by Stripe.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Dependencies</h2>
          <p className="text-slate-600 leading-relaxed">
            The CLI has a minimal dependency footprint: jsdom for HTML parsing, Commander for
            CLI argument handling, and picocolors for terminal output. We regularly audit
            dependencies for known vulnerabilities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Reporting Vulnerabilities</h2>
          <p className="text-slate-600 leading-relaxed">
            If you discover a security vulnerability, please report it responsibly by emailing{' '}
            <a href="mailto:xreticular@gmail.com" className="text-blue-600 font-medium hover:underline">
              xreticular@gmail.com
            </a>{' '}
            with the subject line &quot;Security Report&quot;. We will acknowledge receipt within 48 hours
            and work to address the issue promptly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Open Source</h2>
          <p className="text-slate-600 leading-relaxed">
            The Speakable CLI is distributed under the MIT License. You can inspect the source
            code, audit the dependency tree, and verify the security posture yourself.
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-200">
        <Link href="/" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
