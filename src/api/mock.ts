import type { CritMeApi, CritTake, Post } from './types';

/** The same two pre-generated takes the HTML demo uses. */
export const DEMO_TAKES: CritTake[] = [
  {
    id: 'take-a',
    text: "There's a certain weight to hearing a message like this when you're already wondering if you're ready for what comes next.",
  },
  {
    id: 'take-b',
    text: "Whether you take it as a warning or a reminder, it's definitely not the kind of sentence you casually scroll past.",
  },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Offline stand-in for the backend. The demo runs end to end on this. */
export function createMockApi(authorName = 'Chisom Ihuoma'): CritMeApi {
  const local = new Map<string, string>();
  return {
    async uploadVideo(video, onProgress) {
      for (let i = 1; i <= 5; i++) {
        await wait(120);
        onProgress?.(i / 5);
      }
      const id = `vid_${Date.now()}`;
      local.set(id, video.uri);
      return { id, url: video.uri, durationMs: video.durationMs };
    },
    async generateTakes() {
      await wait(2600);
      return DEMO_TAKES;
    },
    async publishPost(input) {
      await wait(500);
      const post: Post = {
        id: `post_${Date.now()}`,
        videoUrl: local.get(input.videoId) ?? '',
        authorName,
        message: input.message,
        hashtags: input.hashtags,
        take: input.take,
        createdAt: new Date().toISOString(),
      };
      return post;
    },
  };
}
