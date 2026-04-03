export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto pt-4 pb-12 px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account and subscription.</p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <section
          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          aria-labelledby="account-heading"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 id="account-heading" className="text-xl font-bold text-slate-900">Account</h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <span
                  className="material-symbols-outlined text-sm"
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
                Coming Soon
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-8">
              Account management is coming soon. You&apos;ll be able to manage your
              profile, API keys, and team members here.
            </p>
            <button
              className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-400 rounded font-semibold cursor-not-allowed border border-slate-200"
              disabled
              aria-disabled="true"
            >
              Manage Account
            </button>
          </div>
        </section>

        {/* Subscription Section */}
        <section
          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          aria-labelledby="subscription-heading"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 id="subscription-heading" className="text-xl font-bold text-slate-900">
                Subscription
              </h2>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold ring-1 ring-inset ring-blue-600/20">
                Current Plan: Free
              </div>
            </div>

            <div className="relative mb-8 p-6 rounded-lg bg-slate-50 border border-dashed border-slate-300">
              <p className="text-slate-600 leading-relaxed italic">
                Subscription management and billing will be available here soon.
                Upgrade to Pro for CI/CD integration and batch processing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-400 rounded font-semibold cursor-not-allowed border border-slate-200"
                disabled
                aria-disabled="true"
              >
                Manage Subscription
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Powered by</span>
                <svg
                  aria-label="Stripe"
                  className="h-4 fill-current opacity-60"
                  viewBox="0 0 60 25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M59.64 14.28c0-4.38-2.19-7.34-6.07-7.34-3.87 0-6.19 3.01-6.19 7.42 0 5.09 2.76 7.42 6.51 7.42 2.21 0 3.73-.55 4.89-1.22l-.53-2.18c-.83.43-2.07.82-3.88.82-2.31 0-3.83-.98-3.99-3.23h9.19c.02-.27.07-.9.07-1.71zm-9.15-1.57c0-2.04 1.04-3.26 2.94-3.26 1.77 0 2.87 1.22 2.87 3.26h-5.81zm-13.06-2.1c0-1.23.96-2 2.45-2 1.34 0 2.51.46 3.16.85l.62-2.31c-.88-.51-2.45-.94-4.22-.94-3.64 0-5.18 1.96-5.18 4.74v1.64h-2.19v2.51h2.19v7.94h3.17v-7.94h3.33v-2.51h-3.33v-1.97z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Help Banner */}
        <div className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined" aria-hidden="true">help_center</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Need help?</p>
              <p className="text-sm text-slate-600">Our support team is always ready to assist you.</p>
            </div>
          </div>
          <a
            className="text-blue-600 font-medium hover:underline"
            href="mailto:support@announcekit.dev"
          >
            support@announcekit.dev
          </a>
        </div>
      </div>
    </div>
  );
}
