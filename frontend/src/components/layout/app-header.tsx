'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROLE } from '@/types/auth';

export function AppHeader() {
  const router = useRouter();

  const {
    session,
    logout,
  } = useAuth();

  function handleLogout(): void {
    logout();
    router.replace('/login');
  }

  if (!session) {
    return null;
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p className="font-semibold">
            Patient Management
          </p>

          <p className="text-sm text-muted-foreground">
            Aisel engineering assessment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p>{session.user.email}</p>

            <Badge
              variant={
                session.user.role === ROLE.ADMIN
                  ? 'default'
                  : 'secondary'
              }
            >
              {session.user.role}
            </Badge>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut
              className="mr-2 size-4"
              aria-hidden="true"
            />

            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
