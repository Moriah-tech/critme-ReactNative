/**
 * Fallback for any platform without its own file (e.g. web): the H.264 copies,
 * since most browsers can't play HEVC. iOS uses videoSources.ios.js and
 * Android uses videoSources.android.js.
 */
export const VIDEO_SOURCES = {
  alexChen: require('../../../../assets/friends/videos/update-post-3-alex-chen.h264.mp4'),
  samWrites: require('../../../../assets/friends/videos/update-post-4-sam-writes.h264.mp4'),
};
