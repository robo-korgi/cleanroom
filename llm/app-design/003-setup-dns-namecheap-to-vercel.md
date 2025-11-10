# 003 — DNS: Namecheap → Vercel (verification + HTTPS auto)

## Objective
Point the domain from Namecheap to Vercel so Vercel can verify control of the domain and automatically issue HTTPS certificates.

## Requirements
- Domain: `cleanroom.website`
- Preview subdomain: `preview.cleanroom.website`

## Steps

### 1) At Namecheap — DNS records
Leave nameservers as Namecheap defaults (do not switch to custom unless required).  
Add / confirm the following records:

| Host | Type  | Value                     | Purpose                          |
|-----:|------|---------------------------|----------------------------------|
| @    | A     | `76.76.21.21`            | points apex to Vercel            |
| www  | CNAME | `cname.vercel-dns.com.`  | forwards `www → apex` via Vercel |
| preview | CNAME | `cname.vercel-dns.com.` | stable preview alias host       |

Remove any conflicting A, CNAME, URL forwarding, or parking records.

### 2) At Vercel — Add both domains
Go to: Project → Settings → **Domains**  
Add:
- `cleanroom.website`
- `preview.cleanroom.website`

Wait for domain status to become **Verified**.

### 3) HTTPS issuance (no action required)
After verification, Vercel automatically requests and installs **Let’s Encrypt** certificates for both hostnames.

Expected state in Vercel UI:
- Domain status: **Verified**
- Certificate status: **Issued / Active**

No SSL purchase or manual certificate installation is required at Namecheap.

### 4) (Optional) Canonical / redirect behavior
In Vercel → Domains:
- Set `cleanroom.website` as **Primary**
- Configure redirect: `www.cleanroom.website → cleanroom.website`

### 5) Testing
Once verified + certs issued:
- `https://cleanroom.website` should load without certificate warnings
- `https://preview.cleanroom.website` should load and show the Preview build

If preview is not yet pointing to a build, proceed to deployment steps.

## End state
- Vercel controls HTTPS automatically
- prod + preview are routed correctly
- No external SSL cert management needed
