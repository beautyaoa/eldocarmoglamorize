# Eldo Carmo Glamorize — eldocarmoglamorize.com

### 2026-09-30 — Desktop Discovery nav (music apps on hover)
- Added **Discovery** item to desktop nav on ECB + ECG
- On hover / focus: dropdown with YouTube, Spotify, Apple Music, Deezer, YouTube Music (same links as mobile drawer)
- Files changed:
  - `barbershop/index.html`
  - `barbershop/minibar.html`
  - `barbershop/css/style.css`
  - `glamorize/index.html`
  - `glamorize/css/style.css`


Static site for Eldo Carmo Glamorize (women’s beauty), Luanda / Lubango.  
Pure HTML / CSS / JS — ready for Cloudflare Pages.

---

## Key features

- Announcement bar (“Tá Queimar”) — hides on scroll, shows at top
- Header: transparent over hero → solid on scroll (Kylie-style text brand)
- Mobile solid left drawer + Discovery (music links)
- Portal + Barber Shop cross-links
- Hero full-bleed with gradient + CTAs
- Services: image overlay cards + **Agendar** pre-fills booking form
- Gallery (braids / works) + Instagram CTA
- Lubango recruitment (unhas, atendimento) → WhatsApp 924 071 971
- Booking form → WhatsApp **935 627 443**
- Hours: 07:00–21:00 · Location: Kilamba R3

---

## Structure

```
glamorize/
├── index.html
├── css/style.css
├── js/main.js
├── assets/images/
│   ├── eldocarmoglamorizelogo.webp
│   ├── glamorize-model-1.webp
│   ├── team.webp
│   └── braids-1 … braids-6.webp
└── README.md
```

---

## Deploy

Push this folder to its own GitHub repo → Cloudflare Pages  
**Framework:** None · **Output directory:** `/`

---

## Changelog

### 2026-09-30 — Full shell parity with Barber Shop
- Announce bar, scroll-hide header, mobile drawer, Discovery, Portal link
- Soft buttons (10px radius), lilac palette retained
- Hero full-bleed + gradient
- Service overlay cards + Agendar → form pre-fill
- Expanded booking form → WhatsApp
- Gallery polish + Instagram CTA
- Lubango recruitment CTA
- Footer with Portal / Barber links
- No experience videos (no Glamorize clips yet)

## Changelog — 2026-09-30
- Hero: single looping video (`hero-1.mp4`); **hero-2 removed**
- Files: index.html, css/style.css, js/main.js, assets/videos/hero-1.mp4, assets/images/hero-poster-1.webp

### 2026-09-30 — Fix Discovery dropdown hover gap
- Dropdown no longer closes while moving the cursor onto a music link
- Files: `barbershop/css/style.css`, `glamorize/css/style.css`

### 2026-10-01 — Remove hero-2
- Deleted `hero-2.mp4` and `hero-poster-2.webp`
- Hero is only `hero-1.mp4` (looping); dots removed
- Files: `index.html`, `js/main.js`, `assets/videos/hero-2.mp4` (deleted), `assets/images/hero-poster-2.webp` (deleted)

### 2026-10-01 — Safari hero autoplay fix
- Re-encoded `hero-1.mp4` as H.264 Constrained Baseline + faststart (no audio)
- Added `autoplay`, `webkit-playsinline`, muted defaults + touch/click unlock in JS
- Files: `index.html`, `js/main.js`, `assets/videos/hero-1.mp4`

