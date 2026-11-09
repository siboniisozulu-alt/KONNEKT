# KONNEKT encryption status

**End-to-end encryption is NOT enabled in this release.** Messages continue to use the existing Supabase message storage and row-level security. Supabase/database access controls are not end-to-end encryption.

The public device-key table is only a key directory. It does not encrypt message bodies, attachments, group messages, backups, or call media.

Do not display an end-to-end-encrypted badge and do not promise that the server cannot read messages.

Before enabling E2EE, select and integrate a maintained, independently reviewed Signal-protocol implementation compatible with the web and Android targets. The implementation must cover:
- identity keys, signed prekeys and one-time prekeys;
- X3DH/PQXDH session establishment and Double Ratchet (or a reviewed current equivalent);
- device verification and key-change warnings;
- multi-device sessions and key rotation;
- group sender-key distribution and membership changes;
- encrypted attachments with authenticated metadata;
- encrypted local key storage, backup/recovery and account/device-loss flows;
- security review and interoperability tests.

Do not implement a home-grown cipher, reuse one static shared key, or store private keys in Supabase.
