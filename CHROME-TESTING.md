# Chrome testing readiness

Use this checklist after the GitHub Pages deployment finishes. The deployed page should be the React/Vite application, not the standalone HTML prototype.

## Build and deployment

- [ ] `npm run build` completes successfully and creates `dist/index.html` plus the bundled React assets.
- [ ] The Pages workflow succeeds and deploys to `https://siboniisozulu-alt.github.io/KONNEKT/`.
- [ ] Open the deployed URL in Chrome and confirm the KONNEKT welcome screen renders (not a blank page or the old prototype).
- [ ] Check the browser console and Network panel for failed JavaScript, CSS, manifest, or asset requests. Project assets must resolve under `/KONNEKT/`.

## Supabase and authentication

- [ ] Confirm the configured public Supabase URL/key can reach the Auth endpoint and the app restores a session without an initialization error.
- [ ] With two dedicated staging test accounts, register, complete email verification if enabled, sign in, sign out, and sign in again.
- [ ] Confirm profile data persists after refresh and do not use production users or weaken RLS to make a test pass.

## Navigation and implemented features

- [ ] Verify each approved navigation destination opens and returns correctly.
- [ ] The current React app and README define **six** primary destinations: Chats, Updates, Reels, Calls, Discover, and Profile. If the release requirement is exactly five tabs, resolve which destination is excluded before changing navigation; do not silently remove an existing destination.
- [ ] Test only features wired to the configured backend: direct/group messaging and attachments, Reels/posts, Status, Discover, profile, and call signalling. Verify persistence/realtime behavior with both test accounts where applicable.
- [ ] Treat calls, media delivery, and push as unverified until their required backend/storage, TURN, or push services are configured and tested on the target network/device. A UI or signalling record alone is not proof of a successful call or delivery.

## Responsive and console checks

- [ ] Exercise the app at a narrow mobile viewport (including approximately 360px wide) and a desktop viewport; confirm content, inputs, and bottom navigation remain usable without horizontal overflow.
- [ ] Confirm there are no uncaught exceptions, unhandled promise rejections, or persistent failed requests during sign-in, navigation, and the feature smoke tests.
