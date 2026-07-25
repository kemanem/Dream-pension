# Dream Pension Website — Phase 1

A seven-page, mobile-first, pre-rendered marketing site for Dream Pension
(Gofa, Ethiopia), built to the attached PRD. No booking engine, payments, or
accounts — every path funnels to the Contact page.

## What's here

```
dream-pension-website/
├── index.html        Home
├── rooms.html         Rooms & Suites
├── venue.html          Venue (Rooftop/Balcony)
├── gallery.html         Gallery
├── about.html            About
├── culture.html            Cultural Experience (Gofa)
├── contact.html             Contact — the single conversion point
├── assets/
│   ├── css/styles.css   Design system: tokens, components, layout, motion
│   ├── js/main.js        Nav behavior, scroll-reveal, lazy-load, gallery
│   │                       filter/lightbox, contact form validation + submit
│   ├── images/…            One SVG placeholder per photo slot (see below)
│   └── videos/…            Empty — drop rooftop/culture footage in here
└── server/contact-handler/  OPTIONAL self-hosted alternative to Formspree
```

Each page is a **hand-authored, complete static HTML file** — no build step,
no framework, no client-side routing. Open any `.html` file directly, or
serve the folder with any static file server.

## ⚠️ Before you launch: replace the placeholder photography

Every image is currently a generated SVG placeholder (warm gradient + label,
e.g. *"Double Room — Bedroom"*) so the layout, aspect ratios, and lazy-loading
all work correctly today. I didn't have access to Dream Pension's real
photos, so **swap these for real photography before going live**:

1. Shoot or source real photos for each labeled slot in `assets/images/<page>/`.
2. Keep the same filenames (or update the `src` in the matching `.html` file).
3. Export at the sizes already used (see each `<img width height>` — this
   avoids layout shift) and compress to WebP with a JPEG fallback per §9.4 of
   the PRD, e.g. with [Squoosh](https://squoosh.app) or `cwebp`.
4. Everything except each page's hero image already uses
   `loading="lazy"` — leave that attribute in place.

## Contact form setup (§7.3 / §11)

The form in `contact.html` posts to Formspree by default — the simplest way
to satisfy "reliable delivery to an inbox" without running a backend.

1. Create a free form at [formspree.io](https://formspree.io) tied to Dream
   Pension's inbox.
2. In `contact.html`, replace:
   ```html
   <form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" novalidate>
   ```
   with your real form ID.
3. Formspree provides its own spam filtering and rate limiting; the site
   also includes a **honeypot field** (`assets/js/main.js`) as a second layer.

**Don't want a third-party service?** `server/contact-handler/server.js` is a
minimal Node/Express alternative with server-side validation, sanitization,
and rate limiting (5 requests/min/IP), sending mail via SMTP. See the
comment block at the top of that file for setup. If you use it, point the
form's `action` at your deployed endpoint instead of Formspree.

Either way: **never commit SMTP credentials or API keys** — use environment
variables / your host's secret manager.

## Running locally

No build step required.

```bash
cd dream-pension-website
python3 -m http.server 8080
# then open http://localhost:8080
```

## Responsive & performance notes (§7.2, §9.4, §10)

- Mobile-first CSS; breakpoints at ~640px, ~768px, ~1024px.
- Tap targets are ≥44×44px throughout (nav, buttons, form fields, filters).
- All non-hero images use native `loading="lazy"`, fade in via
  `IntersectionObserver`, and reserve `width`/`height` to prevent layout
  shift. Add `srcset` once real photos are in place, sized per breakpoint.
- Motion respects `prefers-reduced-motion` (see top of `styles.css`).
- The Google Fonts link (`Fraunces` + `Inter`) is the only external network
  request beyond the map embed — everything else is self-contained.

## Deployment (Netlify / Vercel)

Because this is plain static HTML/CSS/JS, deployment is a drag-and-drop.

**Netlify**
1. Push this folder to a Git repo (or use Netlify's manual drag-and-drop
   deploy).
2. New site → connect the repo → build command: *(none)* → publish
   directory: `/` (the project root).
3. Netlify serves over HTTPS automatically and redirects HTTP → HTTPS,
   satisfying §11. Add a CDN cache-control header via a `netlify.toml` if you
   want finer control:
   ```toml
   [[headers]]
     for = "/assets/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

**Vercel**
1. `vercel` (CLI) or import the repo in the Vercel dashboard.
2. Framework preset: *Other* (static). No build command needed.
3. Vercel also handles HTTPS and CDN caching automatically.

Either host easily absorbs traffic spikes since every page is static and
cache-friendly (§10).

## Scope reminder (§8)

No booking engine, no payments, no user accounts. All reservation intent
flows through the Contact form or the phone/email links in the footer and
Contact page.
