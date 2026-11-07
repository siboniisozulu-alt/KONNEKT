# KONNEKT cleanup handover

This revision removes hard-coded example people, conversations, contacts, messages, media, posts, viewers, followers, archived chats, group members, documents, creator campaign entries, and fabricated analytics/earnings from the screens where those lists were static. Those screens now start empty and display their existing empty-state messages rather than presenting invented activity as real.

## Preserved
- Supabase project URL and publishable browser key in `src/lib_supabase.js`.
- Authentication/session code and profile persistence.
- Supabase schema file and all existing table/policy definitions.
- Real Supabase-backed chats, account search, posts/Reels feed, statuses, notifications, and live-room records.
- KONNEKT branding, dark interface, and five main tabs.

## Important limitations
- This is a front-end cleanup, not a claim that every screen is fully backend-connected. Some secondary screens (for example device session management, group administration, creator monetization, and live video transport) remain unavailable or need backend/provider integration. Their sample content has been removed so they do not show fabricated users or activity.
- No Supabase records were deleted or modified by this archive preparation. Do not rerun SQL just to apply this front-end cleanup.
- Supabase project access remains protected by the existing Row Level Security policies. Keep the publishable key in the browser; never add a service-role key or database password to this project.

## Build
Run `npm install` and then `npm run build` in the project folder before publishing.
