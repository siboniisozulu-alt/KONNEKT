# TURN and background push setup

## TURN
KONNEKT can consume short-lived ICE/TURN credentials from `VITE_TURN_CREDENTIALS_URL`. The endpoint must authenticate the app/user as appropriate and return JSON shaped like:

```json
{
  "ttlSeconds": 300,
  "iceServers": [
    { "urls": ["turn:turn.example.net:3478?transport=udp", "turns:turn.example.net:5349"], "username": "temporary-user", "credential": "temporary-secret" }
  ]
}
```

Do not put permanent TURN credentials in `VITE_` variables or commit them to GitHub; Vite exposes those values to every app user. A TURN service needs a reachable server/provider and may incur network costs. Without valid TURN credentials, some mobile carrier/Wi-Fi combinations will fail even if STUN works. Test UDP and TCP/TLS fallback on separate networks.

## Push
The app can show in-app notifications while connected. Background Android push requires a OneSignal app, Firebase Cloud Messaging configuration, Android package registration, notification permission prompts and device tests. Set `VITE_ONESIGNAL_APP_ID` only after configuring the provider. Never commit FCM service-account JSON or OneSignal REST API keys. A public app ID is not a server secret.
