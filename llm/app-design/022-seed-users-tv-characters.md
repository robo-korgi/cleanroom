# 022 — Seed Users: TV Characters (TEST FIRST)

Meta:
- created: 2025-11-10T06:14:28.693370Z
- depends-on: 021-user-profile-dynamic-schema.md

## Goal
Provide rich test data by seeding users for **all major characters** (excluding very minor) from:
- *The Office* (US)
- *The Paper* (TV series/film variants acceptable; exclude very minor roles)

## Approach
- Maintain curated CSVs in `seed/sources/` (one per property set):
  - `the-office.csv`: columns `display_name,email,avatar_url?,role?`
  - `the-paper.csv`: same columns
- Seeder expands each row to a full **User**:
  - Assign **`public_uuid`** (uuid v4)
  - Generate `email` if missing (`slug@seed.local`)
  - Optional avatar placeholders (gravatar-style or initials)
  - `roles`: default `['user']`; elevate a few canonical admins for testing
  - `properties`: generate module-appropriate defaults (deterministic seeded RNG)
- Write newline-delimited JSON to `seed/02_users_tv_characters.ndjson`

## Rules
- Exclude very minor characters via a maintained `excluded.txt`
- Deduplicate by name/email/slug
- Deterministic seed: `SEED=4242` env controls RNG

## Tests
- Seeder creates ≥ N users for each show (thresholds per CSV).
- All users have **unique `public_uuid`**, valid emails, and schema-valid `properties`.
- Routes `/u/{public_uuid}` resolve for a sample of seeded users.

## Exit Criteria
- Running `pnpm cr seed users:tv` populates DB locally and in CI fixtures.
- E2E tests can log in as a known seeded user and hit pages that depend on module props.
