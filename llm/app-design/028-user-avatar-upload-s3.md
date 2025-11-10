# 028 — User Avatar Upload (S3) (TEST FIRST)

Meta:
- created: 2025-11-10T06:35:22.246293Z
- depends-on: 023 (CLI), 026 (user CRUD), 027 (avatar selection)
- scope: simple file input (no drag & drop), presigned upload flow

## Objective
Add custom avatar upload capability via S3-compatible storage. This is **optional** and works alongside the avatar selection block (027). If avatar strategy allows custom uploads, users can choose between preset avatars OR upload their own.

## Flow
- On `/account` and admin edit page, show **simple file input** for avatar.
- Upload uses S3-compatible storage (R2/Tigris/S3) via **presigned POST/PUT**.
- After upload, backend stores public URL in `users.avatar_url`.
- Custom uploads override any preset avatar selection from 027.

UI:
- File input `cmp-input-file-avatar`, preview thumbnail, Save button
- On success: success alert + toast; profile card reflects new avatar
- On error: inline error + error alert

TDD:
1. Mock presigned URL API returns success; upload completes; avatar updates.
2. Invalid type/size rejected client-side; error shown.
3. Network error shows error alert; previous avatar remains.

Security:
- Validate MIME/size server-side
- Accept images only (jpg/png/webp)
- Do not expose S3 credentials; presign endpoint auth required

Exit Criteria:
- Avatar upload works in local and preview envs with test bucket.
