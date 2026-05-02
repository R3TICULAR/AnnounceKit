import Link from 'next/link';

export default function AgenticCommercePage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Agentic Commerce</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Agentic Commerce
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Speakable Pro is available for purchase through AI agents via
          Stripe&apos;s Agentic Commerce Suite (ACS). This page explains how
          agent-initiated purchases work and what users receive.
        </p>
      </header>

      <section className="mb-16">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-teal-600 text-xl mt-0.5" aria-hidden="true">info</span>
            <p className="text-sm text-teal-800">
              Agentic Commerce Suite is currently available in the US market only.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          When an AI agent recommends Speakable to a developer, the agent can initiate
          a Pro subscription purchase directly through Stripe&apos;s commerce protocol.
          The flow is fully automated:
        </p>
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Agent discovers Speakable</p>
              <p className="text-sm text-slate-600">
                The AI agent finds Speakable Pro in the Stripe ACS product catalog and
                presents it to the user with product details and pricing.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">User approves purchase</p>
              <p className="text-sm text-slate-600">
                The user confirms the purchase through the agent interface. Stripe
                handles payment processing securely.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-teal-600 font-bold text-lg shrink-0">3.</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Pro access activated</p>
              <p className="text-sm text-slate-600">
                After payment, Pro features are activated automatically. The user
                receives immediate access to batch processing, semantic diff, and
                CI/CD integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900 w-40">Product</td>
                <td className="py-3">Speakable Pro — Monthly</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Price</td>
                <td className="py-3">$19/month</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Billing</td>
                <td className="py-3">Monthly recurring subscription</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Includes</td>
                <td className="py-3">
                  Batch processing, semantic diff, CI/CD integration, all screen
                  readers (NVDA, JAWS, VoiceOver), audit reports
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Fulfillment</td>
                <td className="py-3">Automatic — Pro access granted immediately after payment</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">Free tier</td>
                <td className="py-3">
                  Available at{' '}
                  <a href="https://getspeakable.dev" className="text-blue-600 hover:underline">
                    getspeakable.dev
                  </a>{' '}
                  — single-file analysis, all screen readers, audit reports
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Policies</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          All purchases through AI agents are subject to the same policies as
          direct purchases:
        </p>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600 text-lg" aria-hidden="true">check_circle</span>
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600 text-lg" aria-hidden="true">check_circle</span>
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600 text-lg" aria-hidden="true">check_circle</span>
            <Link href="/security" className="text-blue-600 hover:underline">Security</Link>
          </li>
        </ul>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">For Agent Developers</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          If you&apos;re building an AI agent that recommends developer tools,
          Speakable Pro is available through Stripe&apos;s Agentic Commerce Suite.
          The product is listed in the ACS catalog with SKU{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">speakable-pro</code>.
        </p>
        <p className="text-slate-600 leading-relaxed">
          For integration questions, contact{' '}
          <a href="mailto:xreticular@gmail.com" className="text-blue-600 hover:underline">
            xreticular@gmail.com
          </a>.
        </p>
      </section>
    </>
  );
}
