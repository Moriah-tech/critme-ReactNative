import type { VideoSource } from 'expo-video';
import type { MediaEdits } from '../media/edits';

/** Which bubble a comment answers: the creator's own bubble or Crit's take. */
export type ReplyTarget = 'creator' | 'crit';

export type FeedComment = {
  id: string;
  authorName: string;
  /** Crit's own comment (name shown in teal, Crit avatar). */
  isCrit?: boolean;
  /** Written in this session by the signed-in user. */
  isMine?: boolean;
  text: string;
  replyTo: ReplyTarget;
  /** "View N more replies" — 0 hides the row. */
  replyCount: number;
  starred: boolean;
  createdAt: number;
};

/**
 * A story published from the Story Editor and shown on Home's Stories page.
 * The editor only supports an image today; `image` is null for a text-only story.
 */
export type Story = {
  id: string;
  authorName: string;
  topic: string | null;
  headline: string;
  body: string;
  image: { uri: string; width: number; height: number } | null;
  createdAt: number;
};

/** What the Story Editor hands over when Next is tapped. */
export type StoryDraft = Pick<Story, 'topic' | 'headline' | 'body' | 'image'>;

export type FeedStats ={ comments: number; saves: number; views: number; shares: number };

/**
 * One Explore item as the feed renders it. Built either from demo seed data or
 * from a Post returned by the API after Upload (see feedItemFromPost).
 */
export type FeedItem = {
  id: string;
  video: VideoSource;
  creatorName: string;
  /** Name shown on the creator's message bar ("Marcos" in Demo13). */
  creatorShortName: string;
  /** The creator's bubble text. */
  creatorMessage: string;
  /** Crit's take (the Crit bubble). */
  critTake: string;
  /** Crit Meter score on the 1–5 scale. */
  meterScore: number;
  /** Stats shown on the creator strip. Comments count comes from the comment list when present. */
  stats: FeedStats;
  /** True when the signed-in user posted it in this session. */
  isOwn: boolean;
  /** AA text and CC captions the creator added; drawn over the video. */
  edits?: MediaEdits;
};
