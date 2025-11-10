# 021 — User Profile: Dynamic Schema Strategy (TEST FIRST)

Meta:
- created: 2025-11-10T05:56:56.313552Z
- depends-on: 020-cli-create-new.md
- db: Drizzle + Postgres
- goal: allow per-app user properties chosen at bootstrap to flow into code safely

## Problem
Different apps require different user properties. We want **one bootstrap** that captures properties and a **consistent storage strategy** that supports evolution.

## Strategy
Default to **`users.properties` JSONB** for app-specific fields, with **typed adapters** and **versioned schemas**. Normalize only the *core identity* columns.

### Table (core)
- `users`:
  - `id` (uuid pk)
  - `email` (unique, indexed)
  - `display_name` (nullable)
  - `avatar_url` (nullable)
  - `locale` (varchar, default from bootstrap)
  - `time_zone` (varchar)
  - `roles` (text[]; default ['user'])
  - `properties` (jsonb, default '{}')
  - `properties_schema_version` (int, default 1)
  - timestamps

### Typed adapters
Generate per-app **TypeScript** interfaces (no runtime code here, spec only):
- `DiamondHeartUserProps`
- `OrtholinearUserProps`
- `FrunkUserProps`
- `FlashcardsUserProps`

Adapters map JSON to typed objects with **zod**; Zod schema is generated from bootstrap answers.

### Validation & migration
- On login/signup, validate `properties` against the **current zod schema**; on fail, write a **migration transform** to bump `properties_schema_version`.
- Provide a CLI subcommand `cr props migrate` that runs transforms idempotently.

## Property sets (per template)
### Diamond Heart (meditation)
- `pronouns?` string
- `experienceLevel` enum: beginner|intermediate|advanced
- `backgroundAudio` enum: none|rain|brown-noise
- `cameraDefault` boolean
- `micDefault` boolean
- `sessionVisibility` enum: private|friends|public
- `reminderSchedule` cron-like or preset id

### Ortholinear (tracking)
- `dominantHand` enum: left|right
- `keyboardLayouts` string[] (e.g., 'Colemak', 'QWERTY')
- `devices` array of { make, model }
- `practiceGoals` string
- `units` enum: metric|imperial

### Frunk (car docs)
- `vehicles` array of { nickname, year, make, model }
- `docTypes` string[] (e.g., insurance, registration, maintenance)
- `renewalReminders` boolean
- `preferredMechanic?` string

### Flashcards (study)
- `studyLanguages` string[] (BCP47 like 'en', 'es', 'fr')
- `deckTopics` string[] (e.g., dinosaurs, verbs)
- `srsPreset` enum: gentle|standard|aggressive
- `dailyGoalCards` number

## Cross-cutting core profile (always available)
- `displayName`
- `avatarUrl`
- `locale`, `timeZone`
- `languagesSpoken[]`
- `notificationChannels[]` (email, push, sms)
- `privacyLevel`: normal|high

## Security & Privacy
- PII minimization: default to **privacyLevel=high** in presets
- Access control: only the **owner** and **admin** can read/write `properties`
- Auditing: optional `user_property_changes` table (user_id, diff jsonb, at)
- GDPR: `consent_terms_at`, `consent_analytics` (boolean)

## Tests (integration)
- Creating a user with bootstrap-derived props passes zod validation
- Attempting to write properties not declared in schema → validation error
- Migration transform upgrades v1→v2 without data loss (snapshot test)

## Exit Criteria
- DB has `users.properties` + `properties_schema_version`
- Zod schemas generated for the chosen template(s)
- CLI `cr props migrate` green in CI
