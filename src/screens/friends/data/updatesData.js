/**
 * The four Updates posts exactly as Demo13 defines them (names, times, media,
 * counts, bubble texts, bubble positions, sizes and float delays).
 *
 * Bubble fields:
 *  - kind: 'creator' (the poster's avatar bubble) or 'crit' (Crit's portrait bubble)
 *  - x, y: top-left position as a fraction of the media box (demo uses %)
 *  - size: diameter in points
 *  - delay: float-animation delay in seconds (negative = starts part-way through)
 *
 * mediaRatio = media height / width (square 390×390, tall 390×456, short 390×326).
 * Replace this file with API data later; the shape is all FriendsScreen needs.
 *
 * Videos come from ./videoSources: the platform picks its own format
 * (iOS → original HEVC, Android and web → H.264 copy). Each post still has
 * exactly one video entry.
 */
import { VIDEO_SOURCES } from './videoSources';

export const UPDATE_POSTS = [
  {
    id: 'update-1',
    name: 'Mark Zuk',
    time: '3 hours ago',
    media: { type: 'image', source: require('../../../../assets/friends/images/update-post-1-mark-zuk.jpg') },
    mediaRatio: 1,
    meterScore: 3.8,
    stats: { comments: '2.4k', saves: '1.1k', views: '5.2k', shares: '890' },
    bubbles: [
      { kind: 'creator', text: 'So who is this man in the car?', x: 0.58, y: 0.72, size: 46, delay: 0 },
      {
        kind: 'crit',
        text: "The most interesting part isn't how small we are — it's the path to make us less small.",
        x: 0.16,
        y: 0.64,
        size: 42,
        delay: -3,
      },
    ],
  },
  {
    id: 'update-2',
    name: 'Pearl Zik',
    time: '5 hours ago',
    media: { type: 'image', source: require('../../../../assets/friends/images/update-post-2-pearl-zik.jpg') },
    mediaRatio: 1,
    meterScore: 3.8,
    stats: { comments: '1.8k', saves: '640', views: '3.1k', shares: '420' },
    bubbles: [
      { kind: 'creator', text: 'Context changes everything about this clip.', x: 0.22, y: 0.76, size: 42, delay: -0.6 },
      { kind: 'crit', text: 'Crit captures the stance that is shaping this thread.', x: 0.48, y: 0.62, size: 42, delay: -1.5 },
    ],
  },
  {
    id: 'update-3',
    name: 'Alex Chen',
    time: 'Yesterday',
    media: { type: 'video', source: VIDEO_SOURCES.alexChen },
    mediaRatio: 456 / 390,
    meterScore: 3.8,
    stats: { comments: '960', saves: '310', views: '2.0k', shares: '180' },
    bubbles: [
      { kind: 'creator', text: 'Builders ship; critics refine.', x: 0.18, y: 0.7, size: 44, delay: -1 },
      { kind: 'creator', text: 'Perspective is a scarce resource online.', x: 0.68, y: 0.78, size: 40, delay: -2.5 },
      { kind: 'crit', text: 'Ideas over noise.', x: 0.42, y: 0.58, size: 42, delay: -0.4 },
    ],
  },
  {
    id: 'update-4',
    name: 'Sam Writes',
    time: '2 days ago',
    media: { type: 'video', source: VIDEO_SOURCES.samWrites },
    mediaRatio: 326 / 390,
    meterScore: 3.8,
    stats: { comments: '3.2k', saves: '1.4k', views: '7.8k', shares: '1.1k' },
    bubbles: [
      { kind: 'creator', text: 'The argument is not about the answer — it is about the clip.', x: 0.62, y: 0.68, size: 42, delay: -1.4 },
      { kind: 'crit', text: 'Crit tracks how the clip is being judged across the feed.', x: 0.28, y: 0.8, size: 42, delay: -1.1 },
    ],
  },
];

export const CRIT_AVATAR = require('../../../../assets/friends/images/crit-avatar.png');
