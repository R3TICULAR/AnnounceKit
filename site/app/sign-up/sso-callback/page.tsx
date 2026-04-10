'use client';

import { useEffect } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SSOCallbackPage() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const handleCallback = async () => {
      try {
        // Clerk handles the OAuth callback automatically via the signUp object
        if (signUp?.status === 'complete' && signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId });
          router.push('/tool');
        }
      } catch {
        router.push('/sign-up');
      }
    };

    handleCallback();
  }, [isLoaded, signUp, setActive, router]);

  return (
    <div className="flex-grow flex items-center justify-center py-16 bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Completing sign up...</p>
      </div>
    </div>
  );
}
