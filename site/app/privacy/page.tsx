import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto pt-12 pb-24 px-6">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-slate-500">Last updated: April 12, 2026</p>
      </header>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
          <p className="text-slate-600 leading-relaxed">
            Speakable (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
            This policy explains how we collect, use, and safeguard your information when you use
            our website and CLI tool.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-teal-600 mt-0.5 text-lg" aria-hidden="true">check_circle</span>
              <span><strong className="text-slate-900">Account information:</strong> Email address and name when you create an account via Clerk authentication.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-teal-600 mt-0.5 text-lg" aria-hidden="true">check_circle</span>
              <span><strong className="text-slate-900">Usage data:</strong> Anonymous analytics about how you interact with the website (via Google Analytics, if enabled).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-teal-600 mt-0.5 text-lg" aria-hidden="true">check_circle</span>
              <span><strong className="text-slate-900">Payment information:</strong> Processed securely by Stripe. We never store credit card details directly.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What We Don&apos;t Collect</h2>
          <p className="text-slate-600 leading-relaxed">
            The Speakable CLI tool runs entirely on your machine. We do not collect, transmit, or
            store any HTML content you analyze. Your code never leaves your local environment or
            CI/CD pipeline.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed">
            We use collected information to provide and improve our services, process payments,
            send account-related communications, and analyze aggregate usage patterns. We do not
            sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Services</h2>
          <p className="text-slate-600 leading-relaxed mb-4">We use the following third-party services:</p>
          <ul className="space-y-2 text-slate-600">
            <li><strong className="text-slate-900">Clerk</strong> — Authentication and user management</li>
            <li><strong className="text-slate-900">Stripe</strong> — Payment processing</li>
            <li><strong className="text-slate-900">Google Analytics</strong> — Website usage analytics (optional)</li>
            <li><strong className="text-slate-900">Vercel</strong> — Website hosting</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-4">
            Each service has its own privacy policy governing how they handle your data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Retention</h2>
          <p className="text-slate-600 leading-relaxed">
            We retain account data for as long as your account is active. You can request deletion
            of your account and associated data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            For privacy-related questions, contact us at{' '}
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
  );
}
