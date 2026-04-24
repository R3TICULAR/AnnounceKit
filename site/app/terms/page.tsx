import Link from 'next/link';
import { ScrollReveal } from '../../components/ScrollReveal';

export default function TermsPage() {
  return (
    <ScrollReveal>
    <div className="max-w-3xl mx-auto pt-12 pb-24 px-6">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
        <p className="text-slate-500">Last updated: April 12, 2026</p>
      </header>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing or using Speakable (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Description of Service</h2>
          <p className="text-slate-600 leading-relaxed">
            Speakable is a screen reader simulation tool that generates heuristic predictions of
            how NVDA, JAWS, and VoiceOver interpret HTML. The tool provides accessibility analysis,
            audit reports, and semantic diff capabilities via a CLI and web interface.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Important Disclaimers</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
            <p className="text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Speakable does not guarantee accessibility compliance.</strong>{' '}
              Screen reader output is heuristic and may differ from actual screen reader behavior.
              The tool is designed to assist in identifying potential issues, not to certify compliance
              with WCAG, ADA, Section 508, or any other accessibility standard.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong className="text-slate-900">Speakable does not replace manual testing.</strong>{' '}
              Always validate critical user flows with real assistive technology and real users.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Accounts</h2>
          <p className="text-slate-600 leading-relaxed">
            Some features require an account. You are responsible for maintaining the security of
            your account credentials. You must provide accurate information when creating an account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Subscriptions and Payments</h2>
          <p className="text-slate-600 leading-relaxed">
            Paid plans are billed monthly through Stripe. You may cancel at any time through your
            account settings. Refunds are handled on a case-by-case basis. The free tier is available
            indefinitely with no payment required.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed mb-4">You agree not to:</p>
          <ul className="space-y-2 text-slate-600">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to reverse-engineer, decompile, or disassemble the Service</li>
            <li>Interfere with or disrupt the Service or its infrastructure</li>
            <li>Resell or redistribute the Service without authorization</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property</h2>
          <p className="text-slate-600 leading-relaxed">
            The Speakable CLI tool is distributed under the MIT License. The website, branding,
            and proprietary features remain the intellectual property of Speakable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable for
            any damages arising from your use of the Service, including but not limited to
            accessibility compliance failures, data loss, or business interruption.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            We may update these terms from time to time. Continued use of the Service after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Questions about these terms? Contact us at{' '}
            <a href="mailto:xreticular@gmail.com" className="text-blue-600 font-medium hover:underline">
              xreticular@gmail.com
            </a>.
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
    </ScrollReveal>
  );
}
