'use client';

import { useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SSOCallbackPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const handleCallback = async () => {
      try {
        if (signIn?.status === 'complete' && signIn.createdSessionId) {
          await setActive({ session: signIn.createdSessionId });
          router.push('/tool');
        }
      } catch {
        router.push('/sign-in');
      }
    };

    handleCallback();
  }, [isLoaded, signIn, setActive, router]);

  return (
    <div className="flex-grow flex items-center justify-center py-16 bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Completing sign in...</p>
      </div>
    </div>
  );
}
