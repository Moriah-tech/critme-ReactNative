/**
 * Android: H.264 copies of the two Demo13 videos. Some Android devices and
 * emulators can't decode HEVC, but every Android device plays H.264.
 * Same frames, frame rate, duration and aspect ratio as the originals, and
 * bit-identical audio. Metro picks this file on Android only, so the HEVC
 * originals are not bundled into the Android app.
 */
export const VIDEO_SOURCES = {
  alexChen: require('../../../../assets/friends/videos/update-post-3-alex-chen.h264.mp4'),
  samWrites: require('../../../../assets/friends/videos/update-post-4-sam-writes.h264.mp4'),
};
