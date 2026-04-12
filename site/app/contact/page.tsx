import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto pt-12 pb-24 px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Contact Us</h1>
        <p className="text-lg text-slate-600">
          Have a question, feature request, or need support? We&apos;d like to hear from you.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">mail</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">General Inquiries</h2>
          <p className="text-slate-600 text-sm mb-4">Questions about Speakable, partnerships, or anything else.</p>
          <a
            href="mailto:xreticular@gmail.com"
            className="text-blue-600 font-semibold hover:underline"
          >
            xreticular@gmail.com
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">bug_report</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Bug Reports</h2>
          <p className="text-slate-600 text-sm mb-4">Found an issue with the CLI or web tool? Let us know.</p>
          <a
            href="mailto:xreticular@gmail.com?subject=Bug Report"
            className="text-teal-600 font-semibold hover:underline"
          >
            Report a Bug
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">shield</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Security</h2>
          <p className="text-slate-600 text-sm mb-4">Report a vulnerability responsibly.</p>
          <a
            href="mailto:xreticular@gmail.com?subject=Security Report"
            className="text-blue-600 font-semibold hover:underline"
          >
            Security Report
          </a>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">lightbulb</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Feature Requests</h2>
          <p className="text-slate-600 text-sm mb-4">Have an idea for improving Speakable?</p>
          <a
            href="mailto:xreticular@gmail.com?subject=Feature Request"
            className="text-teal-600 font-semibold hover:underline"
          >
            Suggest a Feature
          </a>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Response Time</h2>
        <p className="text-slate-600 max-w-lg mx-auto">
          We aim to respond to all inquiries within 48 hours. For urgent security issues,
          please include &quot;URGENT&quot; in the subject line.
        </p>
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
