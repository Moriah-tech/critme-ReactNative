/**
 * Authentication contract between the app and a backend.
 *
 * The CritMe backend has no documented auth endpoints yet, so none are assumed
 * here. A backend implementation of AuthService is the only thing missing: see
 * ./service.ts for where to plug it in.
 */

export type AuthSession =
  /** A real session from a backend: the token is sent as the Bearer token by the API client. */
  | { accessToken: string; preview?: false }
  /** Frontend-only development preview: no token exists, nothing is stored or sent. */
  | { preview: true };

export type SignUpInput = { email: string; fullName: string; username: string; password: string };
export type SignInInput = { identifier: string; password: string };

export interface AuthService {
  /** Creates the account and returns an authenticated session (no second login needed). */
  signUp(input: SignUpInput): Promise<AuthSession>;
  signIn(input: SignInInput): Promise<AuthSession>;
  /** Optional: invalidate the token server-side. Failures never block local sign-out. */
  signOut?(accessToken: string): Promise<void>;
  /** Optional: resolves false when a stored token is no longer valid. */
  validateSession?(accessToken: string): Promise<boolean>;
}

/** An error whose message is safe to show to the user. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthNotConfiguredError extends AuthError {
  constructor() {
    super("Sign-in isn't available yet because the CritMe backend isn't connected.");
    this.name = 'AuthNotConfiguredError';
  }
}
