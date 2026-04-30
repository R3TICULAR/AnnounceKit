'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { PageFadeIn } from '../../components/ScrollReveal';

function SettingsContent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Detect successful checkout redirect
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      setShowSuccess(true);
      setRefreshing(true);
      // Clean the URL
      window.history.replaceState({}, '', '/settings');
      // Poll for metadata update (webhook may take a moment)
      const interval = setInterval(async () => {
        try {
          // Force refresh user data from Clerk
          await user?.reload();
          const meta = (user?.publicMetadata || {}) as Record<string, unknown>;
          if (meta.subscriptionStatus === 'active') {
            setRefreshing(false);
            clearInterval(interval);
          }
        } catch {
          // Ignore errors during polling
        }
      }, 2000);
      // Stop polling after 30 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setRefreshing(false);
      }, 30000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [searchParams, user]);

  if (!isLoaded) {
    return (
      <div className="max-w-3xl mx-auto pt-12 pb-12 px-6">
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

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }
    setCancelLoading(true);
    try {
      const res = await fetch('/api/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await user?.reload();
        router.refresh();
      }
    } catch {
      // Cancel failed
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <PageFadeIn>
    <div className="max-w-3xl mx-auto pt-12 pb-12 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account and subscription.</p>
      </div>

      {/* Success banner after checkout */}
      {showSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3" role="alert">
          <span className="material-symbols-outlined text-emerald-600 mt-0.5" aria-hidden="true">check_circle</span>
          <div>
            <p className="font-semibold text-emerald-900">
              {refreshing ? 'Payment successful — activating your Pro plan…' : 'Welcome to Speakable Pro!'}
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              {refreshing
                ? 'This may take a few seconds. Your plan will update automatically.'
                : 'You now have access to batch processing, semantic diff, and CI/CD integration.'}
            </p>
            {refreshing && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-emerald-600">Syncing subscription status…</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                hasActiveSubscription
                  ? 'bg-teal-50 text-teal-700 ring-teal-600/20'
                  : status === 'canceled'
                  ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                  : 'bg-slate-50 text-slate-600 ring-slate-200'
              }`}>
                {hasActiveSubscription
                  ? `Pro — Active`
                  : status === 'canceled'
                  ? 'Pro — Canceled'
                  : `Free Plan`}
              </div>
            </div>

            {hasActiveSubscription ? (
              <div className="space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  You&apos;re on the Pro plan. You have access to batch processing, semantic diff,
                  CI/CD integration, and all screen readers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {portalLoading ? 'Loading…' : 'Manage Billing'}
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {cancelLoading ? 'Canceling…' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            ) : status === 'canceled' ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    Your Pro subscription has been canceled. You&apos;ll retain access until the end
                    of your current billing period.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
                >
                  Resubscribe to Pro
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative p-6 rounded-lg bg-slate-50 border border-dashed border-slate-300">
                  <p className="text-slate-600 leading-relaxed italic">
                    You&apos;re on the Free plan. Upgrade to Pro for batch processing, CI/CD integration, and semantic diff.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Powered by</span>
              <svg aria-label="Stripe" className="h-4 fill-current opacity-60" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                <path d="M59.64 14.28c0-4.38-2.19-7.34-6.07-7.34-3.87 0-6.19 3.01-6.19 7.42 0 5.09 2.76 7.42 6.51 7.42 2.21 0 3.73-.55 4.89-1.22l-.53-2.18c-.83.43-2.07.82-3.88.82-2.31 0-3.83-.98-3.99-3.23h9.19c.02-.27.07-.9.07-1.71zm-9.15-1.57c0-2.04 1.04-3.26 2.94-3.26 1.77 0 2.87 1.22 2.87 3.26h-5.81z" />
              </svg>
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
          <a className="text-blue-600 font-medium hover:underline" href="mailto:xreticular@gmail.com">
            xreticular@gmail.com
          </a>
        </div>
      </div>
    </div>
    </PageFadeIn>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto pt-12 pb-12 px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
