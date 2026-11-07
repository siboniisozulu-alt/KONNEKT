# KONNEKT

KONNEKT — Connecting people everywhere.

## Included backend-connected features

- Supabase email/password authentication and profile persistence.
- One-to-one private conversations with Supabase Realtime message updates.
- Image, video and audio-file attachments in chats.
- 24-hour text/photo/video status publishing and viewing.
- Shared photo/video post feed with likes and comments.
- In-app realtime notifications for messages, likes, comments and follows.
- Row Level Security and Supabase Storage policies in `supabase/konnekt_schema.sql`.

## Not yet a complete production feature

- Live video broadcasting is not connected. The Live setup screen deliberately warns users rather than pretending to broadcast.
- Browser push notifications while the app is closed are not configured; in-app notifications work while the app is open.
- The messaging system is not end-to-end encrypted.
- Reels currently provide a shared media feed, not a full TikTok-style recommendation algorithm.
- Voice notes can be attached as audio files; an in-app voice recorder still needs implementation.

See `SUPABASE-SETUP.md` for database setup and two-account testing instructions.
