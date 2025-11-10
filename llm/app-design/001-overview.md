# 001 — Cleanroom Setup Overview (Spec‑First Pipeline)

**Goal:** Stand up the foundation for fast shipping with two environments:
- **local-docker** (canonical for development & tests)
- **prod-vercel** (public URL guarded by smoke tests)

**What you'll do vs what the LLM personas do**

- **You do:** account creation, domain/DNS, API keys, repo wiring.
- **Architect persona:** sanity checks choices; flags hidden costs/complexity.
- **Spec‑writer persona:** defines a tiny smoke suite for both envs (no code yet).
- **Developer persona:** wires scaffolding to satisfy the minimal smoke.
- **QA persona:** validates parity and files any gaps.

## Milestones

1) **DNS + Hosting + DB live**
   - Namecheap domain points to Vercel
   - Vercel project exists and builds “hello world”
   - Supabase project created

2) **Local Docker up**
   - `docker compose up` runs Next app + Playwright harness

3) **Dual‑env smoke green**
   - App loads (header visible) on **local-docker** and **prod-vercel**
   - Basic analytics tag present
   - Traces/videos captured on failure

