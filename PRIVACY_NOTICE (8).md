# KONNEKT — Closed Testing Privacy Notice

**Version:** 2026-11-12  
**Status:** Draft checklist and notice for South African staging tests. Obtain a POPIA review before inviting external testers or launching publicly.

## 1. Responsible party
The identity, physical/business address and monitored privacy contact for the KONNEKT responsible party must be completed by the project owner before the test is opened. Do not invite testers while these fields are blank.

## 2. Information processed
Depending on enabled features, the staging service may process account email, display name, username, profile bio and avatar, conversations and messages, follows and blocks, uploaded Reel and Status media, comments, reports, notification records, device push subscriptions, technical logs and timestamps.

## 3. Purposes
Information is used to create and secure accounts, operate messaging and social features, store user content, prevent abuse, investigate reports, maintain the service, test reliability and respond to support requests. Marketing messages are not part of this closed test unless a separate opt-in is introduced.

## 4. Hosting and service providers
The staging architecture uses Supabase for authentication, database and storage. Live audio/video calls may use LiveKit if configured. The project owner must record the selected hosting region, provider terms, subprocessors, international transfers and retention settings before testing. Do not claim that all data stays in South Africa unless this has been verified contractually and technically.

## 5. Sharing and visibility
Private conversations are intended for their members. Private drafts and media are owner-only. Published public Reels may be visible to all authenticated staging users; follower-only content is restricted by access policies. Status is designed to expire after 24 hours. Testers should avoid uploading sensitive information because this is a pre-release system.

## 6. Security
The project uses authenticated access, database Row Level Security and private storage buckets. These controls must be tested with separate accounts before external testing. No system can be guaranteed perfectly secure. Report suspected vulnerabilities privately and do not attempt to access another tester's information.

## 7. Retention and deletion
Status expiry cleanup, account deletion, backup retention and log retention must be configured and verified before the test opens. Removing a row from the live database may not immediately remove retained backups. The project owner must publish the actual retention periods after configuring Supabase backups and any third-party services.

## 8. Rights and requests
Provide a monitored contact for access, correction, deletion, objection and privacy complaints. The owner must implement and verify data export/deletion workflows and respond in accordance with applicable law, including POPIA where applicable.

## 9. Children
Do not invite children to this closed test until age eligibility, parental/guardian requirements, safety controls and legal obligations have been reviewed and implemented. This build is intended for adult invited testers only.

## 10. Owner completion checklist
- [ ] Insert responsible party legal name and contact details.
- [ ] Confirm Supabase and LiveKit processing locations and contracts.
- [ ] Set actual retention and backup periods.
- [ ] Test access, correction, export and deletion requests.
- [ ] Complete POPIA impact/risk review and security review.
- [ ] Provide a privacy contact and incident response process.
