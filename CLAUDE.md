# TRAX — Project Notes for Claude

Fitness studio management PWA (React+TS+Vite+Firebase). App lives in
`project/uploads/trax/`. Owner: Göktug (goktugslv@gmail.com, Turkish;
reply in Turkish). Target market: US primary (English content), TR secondary.

## Deploy & infra
- GitHub `traxguo/TRAX` → Vercel auto-deploys `main`. Vercel Root Directory
  is `./` (repo root) — that's why the LS webhook lives at repo-root `api/`
  (a copy also exists in the app dir for a future root fix).
- Live: https://trax-two.vercel.app (app at `/`, marketing page at `/start.html`)
- Firebase project `trax-5b78d` (eur3): Auth email/password + Firestore
  (persistentLocalCache multi-tab). All user data under `users/{uid}`.
- Security rules live in `firestore.rules` (repo root) — paste into the
  Firebase console to deploy. The `subscription` field is server-owned: a
  client may only create a 14-day trial, never edit one afterwards
  (otherwise anyone could grant themselves free access from devtools).
  Renewals come from the webhook (firebase-admin bypasses rules); manual
  changes come from the admin account. Verified by 21 emulator tests:
    cd /tmp && mkdir -p rt && cd rt && npm i firebase-tools @firebase/rules-unit-testing firebase
    cp <repo>/firestore.rules . && cp <repo>/test/*.mjs test/
    npx firebase emulators:exec --project t "node test/firestore.rules.test.mjs"
- Payments: Lemon Squeezy store `traxapp`, product TRAX Monthly $19.99.
  Buy link hardcoded in `SubLock.tsx`. Webhook `/api/ls-webhook` verifies
  X-Signature (env `LS_WEBHOOK_SECRET`), writes subscription via
  firebase-admin (env `FIREBASE_SERVICE_ACCOUNT`). Both env vars set in
  Vercel. Tested end-to-end in test mode ✅.

## Product decisions
- Subscription: 14-day trial → $19.99/mo. Expiry locks the app (SubLock)
  with self-serve "Pay & Renew"; suspended accounts must e-mail.
  Legacy (pre-subscription) accounts read as expired; admin extends manually.
- Admin (goktugslv@gmail.com only): Profile → Yönetici Paneli → GUO Income
  (green revenue page) → "Salonları Yönet" (suspend/extend/delete gyms).
- deleteGym removes the Firestore doc only; orphaned Auth logins land on a
  locked screen (zombie-trial exploit fixed). Full auth deletion = manual in
  Firebase console (or future admin API).
- Members carry `expiresAt`/`joinedAt` ISO fields; `refreshMembers()`
  recomputes daysLeft/status on every load. Never trust stored daysLeft.
- WhatsApp templates: editable per-gym (`waTemplates`, tokens
  {isim}/{kalan}/{salon}); recipients depend on selected template.
- Legal: `legal.ts` TR/EN Terms + Privacy/KVKK, consent checkbox at signup,
  data export in Profile. Lawyer review still pending.
- iOS quirks solved: inputs must be ≥16px (auto-zoom), `--phone-ext`
  viewport hack applies ONLY in standalone PWA, bottom nav/FAB are
  position:absolute inside `.phone`.

## Branding
- Logo: current white wordmark (X arm = arrow) is FINAL for now — owner
  will commission a designer later; do not redesign unprompted.
- Colors: red #FF3B43 (deep #D11F2C), ink #0B0809, money-green #4ADE80.
  Full identity in `.claude/skills/trax-brand/SKILL.md` (load before any
  design work). Owner has canvas-design skill enabled for social posts.
- Landing `/start.html`: strike-through kinetic hero (focus-triggered),
  short card-flight scroll beat, then standard sections. Verify layout
  changes with Playwright screenshots (chromium at /opt/pw-browsers/chromium)
  before pushing — the owner tests on a real iPhone.

## Pending / next
1. Lemon Squeezy identity verification → then add LIVE-mode webhook
   (same URL + secret) and the store is revenue-ready.
2. Lawyer review of legal texts before wide launch.
3. Marketing phase: Instagram (EN). Starter pack artifact + 3 rendered
   posts exist in scratchpad history. Marketing team is defined:
   agents trax-strategist / trax-analyst / trax-copywriter /
   trax-designer / trax-auditor, plus the trax-weekly-content skill
   ("bu haftayı planla" → full weekly run).
4. Possible later: custom domain, admin API to delete Auth users,
   email_verified rules hardening.

## Conventions
- Commit with `git -c gpg.format=openpgp -c commit.gpgsign=false`, author
  Claude <noreply@anthropic.com>; push needs the owner's GitHub token
  (ask if the remote 401s — never store tokens in the repo).
- Build check: `cd project/uploads/trax && npm run build` must pass before
  every push. Vercel deploys ~1-2 min after push.
