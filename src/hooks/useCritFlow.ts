import { useCallback, useRef, useState } from 'react';
import { api, extractHashtags, frameTimestamps } from '../api';
import type { CritTake, LocalVideo, Post, UploadedVideo } from '../api';

export type Phase = 'compose' | 'initializing' | 'takes' | 'publishing' | 'posted';

/**
 * The creator flow:
 *   pick video → write message → Initialize → swipe takes → Upload.
 * The video starts uploading as soon as it's picked, so Initialize usually
 * only has to wait for the takes.
 */
export function useCritFlow(video: LocalVideo) {
  const [phase, setPhase] = useState<Phase>('compose');
  const [message, setMessage] = useState('');
  const [takes, setTakes] = useState<CritTake[]>([]);
  const [takeIndex, setTakeIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useRef<Promise<UploadedVideo> | null>(null);
  const startUpload = useCallback(() => {
    if (!upload.current) {
      upload.current = api.uploadVideo(video, setUploadProgress).catch((e) => {
        upload.current = null; // allow a retry
        throw e;
      });
    }
    return upload.current;
  }, [video]);

  const initialize = useCallback(async () => {
    if (!message.trim()) return;
    setError(null);
    setPhase('initializing');
    try {
      const uploaded = await startUpload();
      const durationSec = (uploaded.durationMs ?? video.durationMs ?? 0) / 1000;
      const result = await api.generateTakes({
        videoId: uploaded.id,
        message,
        hashtags: extractHashtags(message),
        frameTimestamps: frameTimestamps(durationSec),
      });
      setTakes(result);
      setTakeIndex(0);
      setPhase('takes');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase('compose');
    }
  }, [message, startUpload, video.durationMs]);

  const publish = useCallback(async () => {
    const take = takes[takeIndex];
    if (!take) return;
    setError(null);
    setPhase('publishing');
    try {
      const uploaded = await startUpload();
      const created = await api.publishPost({
        videoId: uploaded.id,
        message,
        hashtags: extractHashtags(message),
        take,
      });
      setPost(created);
      setPhase('posted');
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase('takes');
    }
  }, [message, startUpload, takeIndex, takes]);

  const backToCompose = useCallback(() => setPhase('compose'), []);

  return {
    phase,
    message,
    setMessage,
    takes,
    takeIndex,
    setTakeIndex,
    uploadProgress,
    post,
    error,
    startUpload,
    initialize,
    publish,
    backToCompose,
  };
}
