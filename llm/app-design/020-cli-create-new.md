# 020 — CLI: `cleanroom new`

(created placeholder at 2025-11-10T06:35:22.246293Z)


## Addendum — Default Avatar Prompt
In the CLI `cleanroom new` flow, include:
- **Default Avatar Strategy**: choose one
  - `first_initial` (generated SVG)
  - `default_image` (single repo asset)
  - `selectable_images` (limited preset set)
  - `selectable_emojis` (emoji as avatar)
- Persist choice to `profileCore.defaultAvatarStrategy` and ensure `/components` shows the live variant.
