---
name: Supabase URL env var for API server
description: VITE_SUPABASE_URL is the reliable source for Supabase project URL — user-added secrets may be wrong
---

## Rule
For server-side (Node.js/API server) Supabase calls, prefer `VITE_SUPABASE_URL` over a separately-added `SUPABASE_URL` secret.

**Why:** `VITE_SUPABASE_URL` is already set as a plain env var and is verified (the frontend uses it successfully). When a user adds `SUPABASE_URL` as a separate Replit Secret, they often paste a wrong value (service role key, anon key, or malformed URL with invisible characters).

**How to apply:** In `artifacts/api-server/src/routes/notify.ts`, the URL is read as:
```typescript
process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"] ?? ""
```
The `normaliseUrl()` helper also strips all whitespace (including invisible chars) and prepends `https://` if missing.

**Debugging tip:** Pino redacts secret values from logs. To diagnose URL issues, log `urlLength` and `urlPrefix` (first 8 chars) — these won't be redacted and reveal format problems without exposing the secret.
