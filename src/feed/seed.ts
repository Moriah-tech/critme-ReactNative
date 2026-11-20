import type { FeedComment, FeedItem } from './types';

/**
 * The Explore post Demo13 opens on, with its video, bubble texts and counts.
 * This is mock content for the frontend until the feed endpoint exists.
 */
export const SEED_ITEM: FeedItem = {
  id: 'seed-marcos',
  video: require('../../assets/demo/explore-seed.mp4'),
  creatorName: 'Marcos Broley',
  creatorShortName: 'Marcos',
  creatorMessage: "Your 20s can feel like a race you were never given the rules for.\n\nEveryone seems to be moving faster. Someone is earning more. Someone is getting married. Someone has the body, career, confidence, or life you thought you would have by now.\n\nBut Scripture repeatedly points toward a different way of living.\n\nYou don't have to hate who you are today just because you're still becoming who you want to be.\n\nYou don't have to envy someone else's progress. Their blessing doesn't automatically mean you've been forgotten.\n\nYou don't have to turn one bad day into a reason to abandon months of progress.\n\nAnd you don't have to panic when growth takes longer than expected. Some of the most important things in life are built slowly.\n\nAs you improve, stay humble. Remember when you were the beginner.\n\nWhen motivation disappears, don't assume the journey is over. Discipline means continuing to do what matters even when your feelings aren't cooperating.\n\nAnd through all the ambition—career, money, relationships, fitness, success—don't become so consumed with building your life that you neglect your relationship with God.\n\nGrowth without gratitude creates dissatisfaction.\nSuccess without humility creates ego.\nAmbition without direction can take you somewhere you never wanted to go.\n\nBecome better, but don't lose what matters while doing it.\n\nSave this for the days when you feel behind, and share it with a young adult who needs the reminder.",
  critTake: "The most interesting part isn't how small we are — it's that someone is seriously planning the path to make us less small.",
  meterScore: 3.8,
  stats: { comments: 12000, saves: 24000, views: 8000, shares: 3000 },
  isOwn: false,
};

/**
 * Six comments, matching the six rows in Demo13's sheet. Names and lines come
 * from the demo's own pools; the demo shuffles them on every load, here they
 * are fixed so the screen is predictable.
 */
const t0 = Date.now() - 3600_000;
export const SEED_COMMENTS: FeedComment[] = [
  { id: 'c1', authorName: 'Zara M.', text: 'This is exactly how I felt last week.', replyTo: 'creator', replyCount: 14, starred: false, createdAt: t0 },
  { id: 'c2', authorName: 'Kelechi O.', text: 'Crit really said that 😭', replyTo: 'crit', replyCount: 3, starred: false, createdAt: t0 - 1 },
  { id: 'c3', authorName: 'Lena Park', text: 'Saving this for the next time I want to give up.', replyTo: 'creator', replyCount: 0, starred: false, createdAt: t0 - 2 },
  { id: 'c4', authorName: 'Ife Adeyemi', text: 'How does Crit always catch the angle I missed?', replyTo: 'crit', replyCount: 27, starred: false, createdAt: t0 - 3 },
  { id: 'c5', authorName: 'Diego R.', text: 'Respect for posting the honest version.', replyTo: 'creator', replyCount: 1, starred: false, createdAt: t0 - 4 },
  { id: 'c6', authorName: 'Amara N.', text: 'I came for the video and stayed for Crit’s take.', replyTo: 'crit', replyCount: 8, starred: false, createdAt: t0 - 5 },
];
