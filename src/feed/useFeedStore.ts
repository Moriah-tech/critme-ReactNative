import { useCallback, useMemo, useState } from 'react';
import type { Post } from '../api';
import { SEED_COMMENTS, SEED_ITEM } from './seed';
import type { MediaEdits } from '../media/edits';
import type { FeedComment, FeedItem, ReplyTarget, Story, StoryDraft } from './types';

/**
 * Explore feed state for the session: the items on Explore (newest first) and
 * each item's comments. Lives in App so it survives switching tabs.
 *
 * Nothing here is sent to a server yet: comments, stars and posted items are
 * local until the comments/feed endpoints exist.
 */
export function feedItemFromPost(post: Post, edits?: MediaEdits): FeedItem {
  return {
    id: post.id,
    video: post.videoUrl,
    creatorName: post.authorName,
    creatorShortName: post.authorName,
    creatorMessage: post.message,
    critTake: post.take.text,
    // A new post has no ratings yet; the dial starts at its midpoint (3), as in Demo13.
    meterScore: 3,
    stats: { comments: 0, saves: 0, views: 0, shares: 0 },
    isOwn: true,
    edits,
  };
}

let seq = 0;
const newId = () => `local-${Date.now()}-${++seq}`;

export function useFeedStore(currentUserName: string) {
  const [items, setItems] = useState<FeedItem[]>([SEED_ITEM]);
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({ [SEED_ITEM.id]: SEED_COMMENTS });
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [stories, setStories] = useState<Story[]>([]);

  const addComment = useCallback(
    (itemId: string, text: string, replyTo: ReplyTarget) => {
      const c: FeedComment = {
        id: newId(),
        authorName: currentUserName,
        isMine: true,
        text,
        replyTo,
        replyCount: 0,
        starred: false,
        createdAt: Date.now(),
      };
      setComments((all) => ({ ...all, [itemId]: [c, ...(all[itemId] ?? [])] }));
      setNewIds((s) => new Set(s).add(c.id));
      return c;
    },
    [currentUserName],
  );

  const toggleStar = useCallback((itemId: string, commentId: string) => {
    setComments((all) => ({
      ...all,
      [itemId]: (all[itemId] ?? []).map((c) => (c.id === commentId ? { ...c, starred: !c.starred } : c)),
    }));
  }, []);

  /**
   * After Upload: the post goes to the top of Explore. As in Demo13, its comment
   * list starts with the creator's own message, then Crit's take.
   */
  const addPosted = useCallback((post: Post, edits?: MediaEdits) => {
    const item = feedItemFromPost(post, edits);
    const now = Date.now();
    const mine: FeedComment = {
      id: newId(), authorName: post.authorName, isMine: true, text: post.message,
      replyTo: 'creator', replyCount: 0, starred: false, createdAt: now,
    };
    const take: FeedComment = {
      id: newId(), authorName: 'Crit', isCrit: true, text: post.take.text,
      replyTo: 'crit', replyCount: 0, starred: false, createdAt: now,
    };
    setItems((list) => [item, ...list.filter((i) => i.id !== item.id)]);
    setComments((all) => ({ ...all, [item.id]: [mine, take] }));
    setNewIds((s) => new Set(s).add(mine.id).add(take.id));
    return item;
  }, []);

  /** Story Editor → Home Stories page: newest story first. */
  const addStory = useCallback(
    (draft: StoryDraft) => {
      const story: Story = { ...draft, id: newId(), authorName: currentUserName, createdAt: Date.now() };
      setStories((list) => [story, ...list]);
      return story;
    },
    [currentUserName],
  );

  return useMemo(
    () => ({ items, comments, newIds, stories, addComment, toggleStar, addPosted, addStory }),
    [items, comments, newIds, stories, addComment, toggleStar, addPosted, addStory],
  );
}

export type FeedStore = ReturnType<typeof useFeedStore>;
