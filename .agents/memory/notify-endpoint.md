---
name: Seller email notification endpoint
description: API server endpoint that emails users when they receive a chat message
---

## Architecture
- Route: `POST /api/notify-seller` in `artifacts/api-server/src/routes/notify.ts`
- Called fire-and-forget from `ChatWindow.tsx` after `sendMessage.mutateAsync` succeeds
- Notifies the OTHER person in the conversation (buyer→seller or seller→buyer)

## Required env vars (all in shared environment)
- `VITE_SUPABASE_URL` — already set as plain env var (used as primary Supabase URL)
- `SUPABASE_SERVICE_ROLE_KEY` — Replit Secret; fetches seller email from `auth.users` via admin API
- `RESEND_API_KEY` — Replit Secret; sends email via Resend API (free tier: 3000/month)
- `NOTIFY_FROM_EMAIL` — optional; defaults to `onboarding@resend.dev`

## Flow
1. Frontend POSTs `{ recipientId, senderName, bookTitle, messagePreview, chatUrl }`
2. Server fetches recipient email: `GET {SUPABASE_URL}/auth/v1/admin/users/{recipientId}` with service role key
3. Server sends Arabic HTML email via `POST https://api.resend.com/emails`
4. Returns `{ ok: true }` on success, `{ ok: false, reason: "..." }` on any failure (never blocks frontend)

## Resend domain note
With Resend free tier + sandbox mode, emails only deliver to the account owner's email unless a custom domain is verified. User needs to verify a domain on resend.com for full delivery.
