'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/components/auth/auth-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();

  const {
    session,
    isHydrated,
  } = useAuth();

  useEffect(() => {
    if (isHydrated && !session) {
      router.replace('/login');
    }
  }, [isHydrated, router, session]);

  if (!isHydrated || !session) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <Loader2
          className="size-6 animate-spin"
          aria-hidden="true"
        />

        <span className="sr-only">
          Loading authenticated session.
        </span>
      </div>
    );
  }

  return children;
}
