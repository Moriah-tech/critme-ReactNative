import { AuthNotConfiguredError, type AuthService, type AuthSession } from './types';

/**
 * The AuthService the app uses.
 *
 * Connect the backend here: return an implementation of AuthService that calls
 * your real sign-up / sign-in endpoints and returns the access token. Until
 * then every attempt fails with AuthNotConfiguredError and the user stays on
 * the auth screens. Nothing pretends to sign anyone in.
 *
 * Frontend development preview: while the app runs in development (__DEV__),
 * a form that passes its validation opens the app with no backend call and no
 * token. The session is memory-only, so reloading the app returns to
 * Onboarding. This does not depend on any .env file or flag (a missing .env was
 * why the forms used to stay on the auth screens). It is always off in
 * production builds, where the AuthNotConfiguredError path applies until a real
 * AuthService is connected below.
 */
const PREVIEW = __DEV__;

const notConfigured: AuthService = {
  async signUp() {
    throw new AuthNotConfiguredError();
  },
  async signIn() {
    throw new AuthNotConfiguredError();
  },
};

const preview: AuthService = {
  async signUp(): Promise<AuthSession> {
    return { preview: true };
  },
  async signIn(): Promise<AuthSession> {
    return { preview: true };
  },
};

export const authService: AuthService = PREVIEW ? preview : notConfigured;
export const isAuthPreview = PREVIEW;
