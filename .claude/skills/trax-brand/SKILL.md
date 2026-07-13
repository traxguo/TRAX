---
name: trax-brand
description: TRAX brand identity for every design task in this repo — landing pages, Instagram posts/stories, app UI, decks, PDFs. Load BEFORE designing anything TRAX-branded so colors, type, tone and logo usage stay consistent.
---

# TRAX Brand Identity

TRAX is a mobile-first studio management app for gyms, pilates/yoga studios and
personal trainers (TR + US markets). The brand voice is a confident training
partner: direct, energetic, zero corporate fluff.

## Logo

- Wordmark: white "TRAX" where the X's arm becomes an **upward arrow ↗** (growth).
- Files in `project/uploads/trax/public/`: `wordmark.png` (white, transparent),
  `icon-1024.png` (wordmark on Apple-style charcoal gradient).
- Rules: never recolor, skew, or restroke the wordmark. On light grounds use the
  dark icon tile, not a recolored wordmark. Clear space ≥ the height of the X.
- CANONICAL FILES live in this skill: `assets/wordmark.png` (white,
  transparent) and `assets/icon-1024.png`. In ANY rendered design (posts,
  mockups, artifacts) ALWAYS place the real wordmark image — never imitate
  the logo with styled text ("TRAX" in a font is NOT the logo). The text
  fallback (`TRA X` with a red ↗) is allowed ONLY in live UI where an <img>
  cannot load.

## Color

| Token | Hex | Use |
|---|---|---|
| Ink (bg) | `#0b0809` | Primary background — near-black, warm |
| Panel | `#161013` / `#1d1519` | Cards, surfaces |
| Accent red | `#ff3b43` | THE brand color: CTAs, highlights, the X/arrow |
| Deep red | `#d11f2c` | Gradients with accent (`150deg` accent→deep) |
| White | `#ffffff` → `rgba(255,255,255,.58/.36)` | Text hierarchy |
| Success green | `#4ade80` | Money/growth ONLY (income dashboards) |
| Warn amber | `#ffc23d` | Warnings only |

- Dark-first: default every design to the ink background. Light designs are the
  exception, never the default.
- Red is spent, not sprayed: one dominant red moment per composition; the rest
  stays ink/white. Red glow (`rgba(255,59,67,.42)`) for emphasis shadows.
- Never mix green and red as co-equal accents in one piece — green belongs to
  revenue contexts only.

## Typography

- App/UI + digital: **Inter** (300–800). Display: weight 800, tight tracking
  (−0.03em to −0.05em). Numbers: `tabular-nums`; big stats in a mono face
  (JetBrains Mono / SF Mono) is on-brand for "live data" feels.
- Headlines are short, punchy, sentence case ("Defter devri bitti."), often with
  the key word in accent red.
- Uppercase micro-labels with wide tracking (`0.2em+`) for eyebrows: `LIVE · TODAY`.

## Visual motifs

- The **upward arrow ↗** — borrow it from the logo as a repeating motif.
- Soft red radial glows on ink (`radial-gradient(... rgba(255,59,67,.10), transparent)`).
- Rounded 16–24px cards, hairline borders `rgba(255,255,255,.08)`.
- Live/pulse cues: small glowing dots, "CANLI/LIVE" badges, sparklines.
- Phone-frame mockups when showing the product (it's a phone-first PWA).

## Voice & copy

- TR: samimi "sen" dili; EN: direct "you". Short sentences. No exclamation spam.
- Sell the outcome, not the feature: "Kimin üyeliği bitiyor, artık kafanda tutma."
- Emoji: sparing, max 1–2 per piece (💪 🔥 📈 fit the brand).
- Never promise what the app doesn't do; never fake metrics in real marketing
  (fictional numbers only in clearly-illustrative mockups).

## Instagram output specs

- Post 1080×1080, Story/Reels cover 1080×1920, ~4:5 feed 1080×1350.
- One idea per post; headline readable at thumbnail size (≥72px at 1080w).
- Handle: **@traxmanagementapp** · CTA: "14 gün ücretsiz — bio'daki link".
- Content pillars: Problem→Çözüm ~30%, Özellik ~30%, Sosyal kanıt ~20%, Eğitim/İpucu ~20%.

## Product facts (for accurate copy)

- $19.99/month subscription, 14-day free trial, no card required for trial.
- Features: member management, QR check-in, attendance calendar, WhatsApp
  reminders (renewal/win-back/welcome, editable templates), revenue view, EN/TR.
- Installs from the browser (PWA) — no App Store. Contact: traxguo@gmail.com.
