'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [portalLoading, setPortalLoading] = useState(false);

  if (!isLoaded) {
    return (
      <div className="max-w-3xl mx-auto pt-4 pb-12 px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-48 bg-slate-100 rounded-xl" />
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const metadata = (user?.publicMetadata || {}) as Record<string, unknown>;
  const tier = (metadata.subscriptionTier as string) || 'Free';
  const status = metadata.subscriptionStatus as string;
  const hasActiveSubscription = metadata.stripeCustomerId && status === 'active';

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // Portal creation failed
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-12 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account and subscription.</p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" aria-labelledby="account-heading">
          <div className="p-8">
            <h2 id="account-heading" className="text-xl font-bold text-slate-900 mb-6">Account</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-slate-500">Email</span>
                <p className="text-slate-900">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500">Name</span>
                <p className="text-slate-900">{user?.fullName || 'Not set'}</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="inline-flex items-center px-4 py-2 border border-slate-200 text-slate-700 rounded font-semibold hover:bg-slate-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" aria-labelledby="subscription-heading">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 id="subscription-heading" className="text-xl font-bold text-slate-900">Subscription</h2>
              <div className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold ring-1 ring-inset ${
                tier === 'Free'
                  ? 'bg-slate-50 text-slate-600 ring-slate-200'
                  : 'bg-blue-50 text-blue-600 ring-blue-600/20'
              }`}>
                Current Plan: {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </div>
            </div>

            {hasActiveSubscription ? (
              <p className="text-slate-600 leading-relaxed mb-8">
                You&apos;re on the {tier} plan. Manage your subscription, update payment methods, or cancel anytime.
              </p>
            ) : (
              <div className="relative mb-8 p-6 rounded-lg bg-slate-50 border border-dashed border-slate-300">
                <p className="text-slate-600 leading-relaxed italic">
                  You&apos;re on the Free plan. Upgrade to Pro for batch processing, CI/CD integration, and semantic diff.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {hasActiveSubscription ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {portalLoading ? 'Loading…' : 'Manage Subscription'}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
                >
                  Upgrade to Pro
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Powered by</span>
                <svg aria-label="Stripe" className="h-4 fill-current opacity-60" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                  <path d="M59.64 14.28c0-4.38-2.19-7.34-6.07-7.34-3.87 0-6.19 3.01-6.19 7.42 0 5.09 2.76 7.42 6.51 7.42 2.21 0 3.73-.55 4.89-1.22l-.53-2.18c-.83.43-2.07.82-3.88.82-2.31 0-3.83-.98-3.99-3.23h9.19c.02-.27.07-.9.07-1.71zm-9.15-1.57c0-2.04 1.04-3.26 2.94-3.26 1.77 0 2.87 1.22 2.87 3.26h-5.81z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Help */}
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
          <a className="text-blue-600 font-medium hover:underline" href="mailto:support@announcekit.dev">
            support@announcekit.dev
          </a>
        </div>
      </div>
    </div>
  );
}
