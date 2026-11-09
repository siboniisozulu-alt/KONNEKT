# KONNEKT Unified Social Algorithm

KONNEKT combines two product systems:

- **Communication layer (WhatsApp-inspired):** private conversations, groups, real-time message delivery, presence, receipts, media and calls. Conversation ordering uses activity timestamps; private message bodies are not used to rank public Reels.
- **Discovery layer (TikTok-inspired):** public Reels/posts are ranked using recency, followed creators, meaningful likes/comments, creator affinity and optional topic preferences. Seen posts and muted creators are down-ranked. Creator diversity prevents repetitive feeds.

## Existing backend compatibility

`src/services/konnektEngine.jsx` uses existing Supabase tables from `supabase/konnekt_schema.sql`: `posts`, `profiles`, `follows`, `post_likes`, and `post_comments`. It does not add tables, change RLS, reset accounts, or require a paid Supabase plan.

## Integration

Import `getKonnektDiscoveryFeed` into the Discover/Watch feed screen and call it with the signed-in user's ID. Store seen post IDs in the screen's existing state and pass them back on refresh. Use `rankKonnektConversations` when presenting existing conversation rows.

## Ranking principles

1. Fresh content gets a time-decaying boost.
2. Followed creators get a relevance boost.
3. Likes and comments contribute capped engagement signals.
4. A creator whose content the user has liked receives a modest affinity boost.
5. Seen posts and muted creators are reduced or excluded.
6. Creator diversity prevents one account from dominating consecutive slots.
7. Users can still browse followed creators directly; ranking is not a substitute for chronological browsing.

This is an original, transparent KONNEKT ranking implementation, not a copy of TikTok's or WhatsApp's proprietary source code. Real-time chat, end-to-end encryption, online presence and WebRTC calling remain separate engineering tasks and must be tested before being described as production-ready.
