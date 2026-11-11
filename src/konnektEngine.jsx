import { supabase } from '../lib_supabase';

/**
 * KONNEKT unified discovery engine.
 * Combines creator affinity and content engagement (short-video discovery)
 * with user-controlled relationship signals (messaging/social graph).
 * It never reads private message bodies to rank public content.
 */

export function scoreKonnektPost(post, signals = {}, now = Date.now()) {
  const ageHours = Math.max(0, (now - new Date(post.created_at).getTime()) / 3600000);
  const freshness = Math.exp(-ageHours / 72) * 30;
  const followed = signals.followedIds?.has(post.user_id) ? 24 : 0;
  const likes = Math.max(0, Number(post.like_count || 0));
  const comments = Math.max(0, Number(post.comment_count || 0));
  const engagement = Math.min(22, Math.log1p(likes) * 3 + Math.log1p(comments) * 5);
  const affinity = signals.interactedCreatorIds?.has(post.user_id) ? 12 : 0;
  const topicMatch = signals.preferredTopics?.length && post.caption
    ? signals.preferredTopics.some(t => post.caption.toLowerCase().includes(t.toLowerCase())) ? 8 : 0
    : 0;
  const seenPenalty = signals.seenPostIds?.has(post.id) ? 35 : 0;
  const mutedPenalty = signals.mutedCreatorIds?.has(post.user_id) ? 1000 : 0;
  return freshness + followed + engagement + affinity + topicMatch - seenPenalty - mutedPenalty;
}

export function rankKonnektFeed(posts, signals = {}, options = {}) {
  const now = options.now ?? Date.now();
  const scored = posts.map(post => ({ ...post, _score: scoreKonnektPost(post, signals, now) }));
  scored.sort((a, b) => b._score - a._score);

  // Creator diversity: avoid showing a long run from one account.
  const result = [];
  const remaining = [...scored];
  const creatorRun = new Map();
  while (remaining.length && result.length < (options.limit ?? 30)) {
    let index = remaining.findIndex(item => (creatorRun.get(item.user_id) || 0) < 2);
    if (index < 0) index = 0;
    const [item] = remaining.splice(index, 1);
    result.push(item);
    creatorRun.set(item.user_id, (creatorRun.get(item.user_id) || 0) + 1);
  }
  return result;
}

/** Fetches only public posts and public relationship/engagement signals. */
export async function getKonnektDiscoveryFeed(userId, { limit = 30, seenPostIds = [], mutedCreatorIds = [], preferredTopics = [] } = {}) {
  const [postsResult, followsResult] = await Promise.all([
    supabase.from('posts').select('id,user_id,caption,media_url,media_type,created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('follows').select('followed_id').eq('follower_id', userId)
  ]);
  if (postsResult.error) throw postsResult.error;
  if (followsResult.error) throw followsResult.error;

  const posts = postsResult.data || [];
  if (!posts.length) return [];
  const postIds = posts.map(p => p.id);
  const creatorIds = [...new Set(posts.map(p => p.user_id))];
  const [profilesResult, likesResult, commentsResult, myLikesResult] = await Promise.all([
    supabase.from('profiles').select('id,username,full_name,avatar_url').in('id', creatorIds),
    supabase.from('post_likes').select('post_id,user_id').in('post_id', postIds),
    supabase.from('post_comments').select('post_id').in('post_id', postIds),
    supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', postIds)
  ]);
  for (const result of [profilesResult, likesResult, commentsResult, myLikesResult]) {
    if (result.error) throw result.error;
  }

  const profiles = new Map((profilesResult.data || []).map(p => [p.id, p]));
  const likeCounts = new Map();
  const interactedCreatorIds = new Set();
  (likesResult.data || []).forEach(row => {
    likeCounts.set(row.post_id, (likeCounts.get(row.post_id) || 0) + 1);
    if (row.user_id === userId) {
      const owner = posts.find(p => p.id === row.post_id)?.user_id;
      if (owner) interactedCreatorIds.add(owner);
    }
  });
  const commentCounts = new Map();
  (commentsResult.data || []).forEach(row => commentCounts.set(row.post_id, (commentCounts.get(row.post_id) || 0) + 1));
  const likedIds = new Set((myLikesResult.data || []).map(row => row.post_id));
  const enriched = posts.map(post => ({
    ...post,
    creator: profiles.get(post.user_id) || null,
    like_count: likeCounts.get(post.id) || 0,
    comment_count: commentCounts.get(post.id) || 0,
    liked_by_me: likedIds.has(post.id)
  }));

  return rankKonnektFeed(enriched, {
    followedIds: new Set((followsResult.data || []).map(row => row.followed_id)),
    interactedCreatorIds,
    seenPostIds: new Set(seenPostIds),
    mutedCreatorIds: new Set(mutedCreatorIds),
    preferredTopics
  }, { limit });
}

/** Chat list ordering uses conversation activity, not message content. */
export function rankKonnektConversations(conversations = []) {
  return [...conversations].sort((a, b) => {
    const aTime = new Date(a.lastAt || a.created_at || 0).getTime();
    const bTime = new Date(b.lastAt || b.created_at || 0).getTime();
    return bTime - aTime;
  });
}

export const KONNEKT_ENGINE_VERSION = '1.0.0';

/** Ranks public member suggestions using follows, creator activity and presence only. */
export function rankKonnektPeople(people = [], signals = {}) {
  const followed = signals.followedIds || new Set();
  const followedBy = signals.followedByIds || new Set();
  const postCounts = signals.postCounts || {};
  const onlineIds = signals.onlineIds || new Set();
  return people
    .filter(person => !followed.has(person.id))
    .map(person => ({
      ...person,
      _recommendationScore:
        (followedBy.has(person.id) ? 16 : 0) +
        Math.min(20, Number(postCounts[person.id] || 0) * 2) +
        (onlineIds.has(person.id) ? 3 : 0) +
        (person.bio ? 1 : 0)
    }))
    .sort((a, b) => b._recommendationScore - a._recommendationScore || (a.full_name || '').localeCompare(b.full_name || ''));
}
