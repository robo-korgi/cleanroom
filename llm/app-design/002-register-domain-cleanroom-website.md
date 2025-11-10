# 002 — Register `cleanroom.website` and prepare DNS (no SSL here)

## Objective
Own the domain and ensure the DNS zone is clean. Do **not** purchase SSL at the registrar.

## Steps
1) Register `cleanroom.website` at the registrar.
2) Enable WHOIS privacy.
3) Remove/avoid default A/CNAME/URL forwarding records that conflict with later hosting.
4) Leave nameservers as the registrar’s defaults (unless already using custom).

## SSL/TLS
- Do **not** buy or configure SSL at the registrar in this step.
- SSL/TLS certificates will be **auto‑issued by Vercel** after the domain is added and verified in the hosting step (see step 006).
- You will get HTTPS for `cleanroom.website` and subdomains (e.g., `preview.cleanroom.website`) automatically once verified.

## Handoff to hosting
Proceed to hosting setup where the domain is added to Vercel and DNS records are pointed (A/CNAME). Certificate issuance happens there.
