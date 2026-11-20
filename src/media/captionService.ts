import type { CaptionLine } from './edits';

/**
 * Automatic captions (speech-to-text) for a video.
 *
 * Nothing in this project can transcribe audio today, and none is invented here.
 * Real options, all outside what Expo Go can run:
 *  - a backend / cloud speech-to-text service (e.g. a Whisper endpoint): upload the
 *    video's audio, get timed segments back, map them to CaptionLine[];
 *  - an on-device recogniser in a custom dev build (a native module), which Expo Go cannot load.
 *
 * To connect one, return an implementation of CaptionService below. Until then,
 * transcribe() throws CaptionsNotConfiguredError and the captions sheet tells the
 * user so; captions can still be typed and timed by hand.
 */
export class CaptionsNotConfiguredError extends Error {
  constructor() {
    super('Automatic captions need a speech-to-text service, which is not connected yet.');
    this.name = 'CaptionsNotConfiguredError';
  }
}

export interface CaptionService {
  transcribe(videoUri: string): Promise<CaptionLine[]>;
}

export const captionService: CaptionService = {
  async transcribe() {
    throw new CaptionsNotConfiguredError();
  },
};
