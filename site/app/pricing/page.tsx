import Link from 'next/link';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  priceSuffix?: string;
  features: Array<{ text: string; bold?: boolean }>;
  cta: { label: string; href: string };
  recommended?: boolean;
}

const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    features: [
      { text: 'Unlimited web tool usage' },
      { text: 'Single-file CLI analysis' },
      { text: 'All screen readers (NVDA, JAWS, VoiceOver)' },
      { text: 'Audit report generation' },
    ],
    cta: { label: 'Get Started', href: '/tool' },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    priceSuffix: '/mo per seat',
    recommended: true,
    features: [
      { text: 'Everything in Free', bold: true },
      { text: 'Batch processing (multiple files)' },
      { text: 'CI/CD pipeline integration with JSON output' },
      { text: 'Semantic diff (before/after comparison)' },
      { text: 'Priority support' },
    ],
    cta: { label: 'Start Pro Trial', href: '/settings' },
  },
  {
    id: 'team-enterprise',
    name: 'Team / Enterprise',
    price: 'Custom pricing',
    features: [
      { text: 'Everything in Pro', bold: true },
      { text: 'Shared team dashboards and historical reports' },
      { text: 'Custom rule configuration' },
      { text: 'SSO/SAML authentication' },
      { text: 'SLA and dedicated support' },
      { text: 'Volume pricing' },
    ],
    cta: { label: 'Contact Sales', href: '/settings' },
  },
];

export default function PricingPage() {
  return (
    <div className="flex-grow pb-24">
      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center pt-12 mb-16 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          Pricing
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The analysis tool is free. Pay for workflow automation.
        </p>
      </section>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch px-6">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`flex flex-col p-8 bg-white rounded-xl transition-shadow ${
              tier.recommended
                ? 'border-2 border-blue-600 shadow-xl relative md:scale-105 z-10'
                : 'border border-slate-200 hover:shadow-lg'
            }`}
          >
            {tier.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                Recommended
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-2">{tier.name}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {tier.price}
                </span>
                {tier.priceSuffix && (
                  <span className="text-slate-500 font-medium">{tier.priceSuffix}</span>
                )}
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {tier.features.map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <span
                    className={`material-symbols-outlined text-blue-600 text-lg ${f.bold ? 'font-bold' : ''}`}
                    aria-hidden="true"
                  >
                    check_circle
                  </span>
                  <span
                    className={`text-sm ${f.bold ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.cta.href}
              className={`w-full py-3 px-4 rounded-lg font-bold text-center transition-all active:scale-95 block ${
                tier.recommended
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                  : 'border-2 border-slate-200 text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tier.cta.label}
            </Link>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="max-w-4xl mx-auto mt-16 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 px-6 py-4 rounded-xl border border-blue-100">
          <span className="material-symbols-outlined text-blue-600" aria-hidden="true">
            info
          </span>
          <p className="text-sm text-slate-700 leading-relaxed text-left">
            Subscription management coming soon. All screen readers are available
            on every tier — we never gate accessibility features behind a paywall.
          </p>
        </div>
      </div>
    </div>
  );
}
