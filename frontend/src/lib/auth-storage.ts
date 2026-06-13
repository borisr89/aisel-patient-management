import type { AuthSession } from '@/types/auth';

const AUTH_STORAGE_KEY =
  'aisel-patient-management-auth';

const AUTH_SESSION_CHANGED_EVENT =
  'aisel-auth-session-changed';

function isAuthSession(
  value: unknown,
): value is AuthSession {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const candidate = value as {
    token?: unknown;
    user?: {
      email?: unknown;
      role?: unknown;
    };
  };

  return (
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    typeof candidate.user?.email === 'string' &&
    candidate.user.email.length > 0 &&
    (candidate.user.role === 'admin' ||
      candidate.user.role === 'user')
  );
}

export function getAuthSessionSnapshot():
  | string
  | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(
    AUTH_STORAGE_KEY,
  );
}

export function getAuthSessionServerSnapshot():
  | null {
  return null;
}

export function parseAuthSession(
  snapshot: string | null,
): AuthSession | null {
  if (!snapshot) {
    return null;
  }

  try {
    const parsed: unknown =
      JSON.parse(snapshot);

    return isAuthSession(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function subscribeToAuthSession(
  onStoreChange: () => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  function handleStorageChange(
    event: StorageEvent,
  ): void {
    if (event.key === AUTH_STORAGE_KEY) {
      onStoreChange();
    }
  }

  function handleLocalChange(): void {
    onStoreChange();
  }

  window.addEventListener(
    'storage',
    handleStorageChange,
  );

  window.addEventListener(
    AUTH_SESSION_CHANGED_EVENT,
    handleLocalChange,
  );

  return () => {
    window.removeEventListener(
      'storage',
      handleStorageChange,
    );

    window.removeEventListener(
      AUTH_SESSION_CHANGED_EVENT,
      handleLocalChange,
    );
  };
}

export function saveAuthSession(
  session: AuthSession,
): void {
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session),
  );

  window.dispatchEvent(
    new Event(AUTH_SESSION_CHANGED_EVENT),
  );
}

export function removeAuthSession(): void {
  window.localStorage.removeItem(
    AUTH_STORAGE_KEY,
  );

  window.dispatchEvent(
    new Event(AUTH_SESSION_CHANGED_EVENT),
  );
}
