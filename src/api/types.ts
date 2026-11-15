export type LocalVideo = {
  uri: string;
  durationMs?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
};

export type UploadedVideo = {
  id: string;
  url: string;
  durationMs?: number;
};

export type CritTake = {
  id: string;
  text: string;
};

export type GenerateTakesInput = {
  videoId: string;
  /** What the creator typed in their message bar. */
  message: string;
  /** Hashtags found in the message, without the "#". */
  hashtags: string[];
  /** Frame timestamps (seconds) for the vision model. See sampling.ts. */
  frameTimestamps: number[];
};

export type PublishPostInput = {
  videoId: string;
  message: string;
  hashtags: string[];
  take: CritTake;
};

export type Post = {
  id: string;
  videoUrl: string;
  authorName: string;
  message: string;
  hashtags: string[];
  take: CritTake;
  createdAt: string;
};

export interface CritMeApi {
  uploadVideo(video: LocalVideo, onProgress?: (fraction: number) => void): Promise<UploadedVideo>;
  generateTakes(input: GenerateTakesInput): Promise<CritTake[]>;
  publishPost(input: PublishPostInput): Promise<Post>;
}
