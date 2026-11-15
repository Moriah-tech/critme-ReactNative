import type { CritMeApi, CritTake, Post, UploadedVideo } from './types';

/**
 * Real backend client. The endpoints below are a suggested contract. Rename
 * them to match the backend; the screens only depend on the CritMeApi interface.
 *
 *   POST {baseUrl}/videos   multipart "file"            → UploadedVideo
 *   POST {baseUrl}/takes    GenerateTakesInput (JSON)   → { takes: CritTake[] }
 *   POST {baseUrl}/posts    PublishPostInput (JSON)     → Post
 */
export function createHttpApi(baseUrl: string, getToken: () => Promise<string | null>): CritMeApi {
  async function headers(json: boolean) {
    const token = await getToken();
    const h: Record<string, string> = { Accept: 'application/json' };
    if (json) h['Content-Type'] = 'application/json';
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  async function postJson<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: await headers(true),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${path} failed: ${res.status} ${await res.text()}`);
    return (await res.json()) as T;
  }

  return {
    uploadVideo(video, onProgress) {
      // XMLHttpRequest instead of fetch because it reports upload progress.
      return new Promise<UploadedVideo>(async (resolve, reject) => {
        const form = new FormData();
        form.append('file', {
          uri: video.uri,
          name: video.fileName ?? 'upload.mp4',
          type: video.mimeType ?? 'video/mp4',
        } as unknown as Blob);
        if (video.durationMs != null) form.append('durationMs', String(video.durationMs));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${baseUrl}/videos`);
        const h = await headers(false);
        Object.entries(h).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress?.(e.loaded / e.total);
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(`/videos failed: ${xhr.status} ${xhr.responseText}`));
        };
        xhr.onerror = () => reject(new Error('/videos failed: network error'));
        xhr.send(form);
      });
    },

    async generateTakes(input) {
      const data = await postJson<{ takes: CritTake[] }>('/takes', input);
      return data.takes;
    },

    publishPost(input) {
      return postJson<Post>('/posts', input);
    },
  };
}
