import * as SecureStore from 'expo-secure-store';

/**
 * Access-token persistence in the platform keystore (Android Keystore / iOS
 * Keychain) through expo-secure-store. Only the token is stored: passwords are
 * never written anywhere.
 */
const KEY = 'critme.accessToken';

/** Held in memory too, so the API client can read it synchronously-fast without hitting the keystore each call. */
let cached: string | null | undefined;

export async function getStoredToken(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    cached = await SecureStore.getItemAsync(KEY);
  } catch {
    cached = null;
  }
  return cached;
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEY, token);
  cached = token;
}

export async function clearToken(): Promise<void> {
  cached = null;
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Nothing stored, or the keystore is unavailable: the in-memory copy is already cleared.
  }
}

/** Keeps a preview (never persisted) session visible to the API client. */
export function setMemoryToken(token: string | null): void {
  cached = token;
}
