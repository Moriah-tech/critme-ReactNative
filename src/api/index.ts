import { createHttpApi } from './http';
import { createMockApi } from './mock';
import type { CritMeApi } from './types';

/**
 * Connect the backend here:
 *  1. set EXPO_PUBLIC_CRITME_API_URL (e.g. in .env), and
 *  2. replace getToken with your auth session.
 * With no URL set, the app runs on the mock API and the demo takes.
 */
const BASE_URL = process.env.EXPO_PUBLIC_CRITME_API_URL;

async function getToken(): Promise<string | null> {
  return null; // TODO: return the signed-in user's access token
}

export const api: CritMeApi = BASE_URL ? createHttpApi(BASE_URL, getToken) : createMockApi();

export * from './types';
export { extractHashtags, frameTimestamps, frameCountFor } from './sampling';
