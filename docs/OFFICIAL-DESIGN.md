# KONNEKT official visual direction

KONNEKT 2.0 uses the official Royal Purple, Solar Gold, Sunset Orange, Electric Indigo and Neo Cyan palette. Royal Purple is the dominant brand colour; Electric Indigo supports secondary surfaces; Solar Gold marks important states; Sunset Orange is reserved for primary actions; Neo Cyan marks selected and keyboard-focused interactions. Do not use WhatsApp green or imitate TikTok branding.

## Brand tokens

| Token | Value | Use |
| --- | --- | --- |
| Royal Purple | `#6A0DAD` | Primary identity, navigation and branded surfaces |
| Solar Gold | `#FFC107` | Important indicators and status accents |
| Sunset Orange | `#FF6B00` | Primary action buttons |
| Electric Indigo | `#3A0CA3` | Secondary surfaces and depth |
| Neo Cyan | `#00E6FF` | Selected interactive accents and focus rings |
| Canvas | `#10091B` | Dark application canvas |
| Primary text | `#FAF8FF` | Text on dark surfaces |
| Muted text | `#C4B4D0` | Supporting text on dark surfaces |

## Interface guidance

Use rounded, consistent components, readable text contrast, responsive layouts and reduced-motion-aware transitions. Dark and light appearance are supported by the app shell; individual legacy screens should be checked for inline colors before claiming complete theme parity. Use `src/konnekt-theme.css` for shared tokens and global styling.

## Assets and implementation

The web manifest uses the existing root `konnekt-192.png` and `konnekt-512.png` artwork rather than paths to icons that are not present in the repository. Android launcher resources remain part of the existing Capacitor project. Verify generated Android adaptive icons and splash assets on-device before release; changing the launcher background resource alone does not regenerate the image assets.
