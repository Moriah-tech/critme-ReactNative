import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService, isAuthPreview } from './service';
import { clearToken, getStoredToken, saveToken, setMemoryToken } from './tokenStore';
import type { AuthSession, SignInInput, SignUpInput } from './types';

/**
 * Session state for the whole app.
 *  - 'loading':   looking for a stored session (shows nothing, then Home or Onboarding)
 *  - 'signedOut': Onboarding / Create Account / Log In
 *  - 'signedIn':  the existing CritMe app
 */
type Status = 'loading' | 'signedOut' | 'signedIn';

type AuthValue = {
  status: Status;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');

  // Returning user: a stored token goes straight to Home, unless the backend says it is no longer valid.
  useEffect(() => {
    let alive = true;
    (async () => {
      // Preview sessions are never stored; always start at Onboarding.
      if (isAuthPreview) return alive && setStatus('signedOut');
      const token = await getStoredToken();
      if (!token) return alive && setStatus('signedOut');
      let valid = true;
      try {
        if (authService.validateSession) valid = await authService.validateSession(token);
      } catch {
        valid = true; // Could not reach the backend: keep the user signed in rather than logging them out offline.
      }
      if (!valid) await clearToken();
      if (alive) setStatus(valid ? 'signedIn' : 'signedOut');
    })();
    return () => {
      alive = false;
    };
  }, []);

  const start = useCallback(async (session: AuthSession) => {
    if (session.preview) setMemoryToken(null);
    else await saveToken(session.accessToken);
    setStatus('signedIn');
  }, []);

  const signUp = useCallback((input: SignUpInput) => authService.signUp(input).then(start), [start]);
  const signIn = useCallback((input: SignInInput) => authService.signIn(input).then(start), [start]);

  const signOut = useCallback(async () => {
    const token = await getStoredToken();
    try {
      if (token && authService.signOut) await authService.signOut(token);
    } catch {
      // Local sign-out must always succeed.
    }
    await clearToken();
    setStatus('signedOut');
  }, []);

  const value = useMemo(() => ({ status, signUp, signIn, signOut }), [status, signUp, signIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}
