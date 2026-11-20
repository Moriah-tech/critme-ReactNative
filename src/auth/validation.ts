/**
 * Client-side form checks. These only save a round trip: the backend must
 * enforce the same rules (and more) itself.
 *
 * The supplied designs do not specify password rules or a confirm-password
 * field, so the only password rule here is a sensible minimum length.
 */
export const PASSWORD_MIN = 8;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[A-Za-z0-9._]{3,30}$/;
const MOBILE = /^\+?[0-9][0-9\s-]{6,17}$/;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function validateSignUp(v: { email: string; fullName: string; username: string; password: string }) {
  const e: FieldErrors<'email' | 'fullName' | 'username' | 'password'> = {};
  if (!v.email.trim()) e.email = 'Enter your email.';
  else if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!v.fullName.trim()) e.fullName = 'Enter your full name.';
  if (!v.username.trim()) e.username = 'Choose a username.';
  else if (!USERNAME.test(v.username.trim())) e.username = 'Use 3-30 letters, numbers, dots or underscores.';
  if (!v.password) e.password = 'Create a password.';
  else if (v.password.length < PASSWORD_MIN) e.password = `Use at least ${PASSWORD_MIN} characters.`;
  return e;
}

export function validateSignIn(v: { identifier: string; password: string }) {
  const e: FieldErrors<'identifier' | 'password'> = {};
  const id = v.identifier.trim();
  if (!id) e.identifier = 'Enter your username, email or mobile number.';
  else if (id.includes('@') && !EMAIL.test(id)) e.identifier = 'Enter a valid email address.';
  else if (!id.includes('@') && /^[+0-9]/.test(id) && !MOBILE.test(id)) e.identifier = 'Enter a valid mobile number.';
  if (!v.password) e.password = 'Enter your password.';
  return e;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
