# KONNEKT two-account RLS and storage test plan

Create two verified staging accounts A and B using separate browser profiles/devices. Never use real user data.

| Test | Account A expected result | Account B expected result |
|---|---|---|
| Read own profile | Allowed | Allowed for authenticated profile discovery |
| Update own profile | Allowed | Allowed |
| Update other profile | Denied | Denied |
| Create direct conversation through RPC | A and B become members | Same conversation visible to B |
| Add arbitrary member via direct table insert | Denied | Denied |
| Read conversation as non-member | Denied | Denied |
| Insert message as own user in member conversation | Allowed | Allowed |
| Insert message pretending to be other user | Denied | Denied |
| Read another user's private Reel draft | Denied | Denied |
| Read published public Reel | Allowed | Allowed unless blocked |
| Read private avatar media not referenced by profile | Denied | Denied |
| Read active status as follower | Allowed | Allowed if following and not blocked |
| Read expired status | Denied | Denied |
| Read another user's push subscription | Denied | Denied |
| Read another user's reports | Denied | Denied |
| Update moderation status from browser | Denied | Denied |

## Required additional checks
- Test both directions of block relationships.
- Test a user who is not signed in; all protected tables and private buckets must deny access.
- Test forged IDs, malformed UUIDs, empty messages, oversized content and repeated requests.
- Verify all media links are short-lived signed URLs and expire.
- Verify moderator Edge Function denies normal users and permits only a trusted `app_metadata.role = moderator` user.
- Do not sign off based on successful reads alone; all expected-denial tests must pass.
