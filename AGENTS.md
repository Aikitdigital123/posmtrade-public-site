# POSMTRADE public site – Agent Guide (Sajtik / Сайтік)

Last verified: 2026-11-23

## 1. Purpose

The public website of POSMTRADE: what the company makes (cardboard displays, stands, POS materials, labels,
packaging, 3D mock-ups) and how its automation works. It is also the **public home page, privacy policy and
terms of use for Google OAuth**, and every agent e-mail footer links to it. Built with **Vite + vanilla
JavaScript**, published by GitHub Pages: <https://aikitdigital123.github.io/posmtrade-public-site/>.

Sajtik (Сайтік) is the agent that makes the changes Marina or the owner ask for – quickly, safely, through GitHub.

## 2. Where to change what

| Change | File |
|---|---|
| Any text on the home page (UA / CZ / EN) | `src/content/uk.json`, `cs.json`, `en.json` – **same keys in all three** |
| Contact people (Marina, Gergel), office phone and address, logo path | `src/content/site.json` → `people`, `office` |
| Projects section: types and counts | `projects.types` in the three JSON files; per-year numbers in `site.json` → `projectsByYear` (from `~/Data/Posmtrade/Znalosti/projekty.db`, rows `druh='projekt'`) |
| Privacy policy / terms text | `src/content/legal/<lang>-privacy.html`, `<lang>-terms.html` |
| Colours, fonts, spacing, animations | `src/styles/main.css` (colours are tokens on `:root`) |
| Product illustrations (services cards) | `build/icons.mjs` (key = `icon` in the JSON) |
| Agents menu (cards: name, role, text) | `agents.items` in the three JSON files; avatar = `public/agents/<avatar>.webp` (no file → drawn badge) |
| Page layout, sections, die-line drawing | `build/render.mjs` |
| Rotating 3D stand in the hero (owner likes it – keep) | `src/stand3d.js` |
| Behaviour (menu, counters, reveal on scroll) | `src/main.js` |
| Images, favicon, files served as-is | `public/` (referenced as `/name.png`) |

`pages/` and `dist/` are generated – never edit them. A new service card = one more item in `services.items`
in **all three** language files. Ukrainian is the default language (root), CZ in `cs/`, EN in `en/`; `uk/`
is a copy kept for old links.

## 3. How a change is made (every time)

1. `git pull --ff-only` in `~/Projects/aikit/posmtrade-public-site`.
2. Change the smallest thing that does what was asked. A text change goes into all three languages
   (translate it yourself; Ukrainian first if Marina wrote in Ukrainian).
3. `npm run check` – builds the site and checks: all 12 public pages exist (OAuth + e-mail footer URLs),
   no broken links, no secrets or private e-mail addresses. It must say `check: OK`.
   Then `npm test` – Playwright tests on desktop and phone (what they cover: `docs/QA.md`). All must pass;
   a new interactive element gets its own test. GitHub runs both again before it deploys.
4. Look at it: `npm run dev` (or a screenshot of `npm run preview`) at desktop and phone width.
5. Commit with a short message saying what changed for the reader of the site, then `git push` to `main`.
   GitHub Actions builds and deploys in about a minute.
6. Verify the live page (`gh run watch` / open the URL) and answer the requester in one or two lines:
   what changed and the link.

Push to `main` only for a change somebody asked for. Bigger redesigns, new pages or anything unclear: show
a preview first and wait for «так / ano / ok».

## 4. Never

- Client names, brands (projects are shown by type and count only – the owner decides if brands may be named), photos of client projects, prices, orders, documents – the site is public.
  Photos of real displays only when the owner confirms the client agreed.
- E-mail addresses other than the contact people in `site.json` (`npm run check` blocks them), tokens, `.env`, logs, internal system details (servers, paths, route keys, how the
  agents are built). Agent persona names and what they do are public – they sign our e-mails.
- Photos of real people. The Конструктерчик/Макетчик avatar is a photo of a real person (a meme) – never on the
  site; Макетчик has a drawn «3D» badge instead.
- Removing or renaming `index.html`, `privacy.html`, `terms.html` (root and `uk/`, `cs/`, `en/`): Google OAuth
  and every agent e-mail depend on them. Changing the meaning of privacy/terms needs the owner.
- Trackers, analytics, cookies, forms that send data, third-party scripts or fonts from CDNs (fonts are
  bundled from `@fontsource`).
- Images without a licence we can use. The current P logo (`public/logo.png`) is a downloaded stock icon –
  see `docs/LOGO.md`.

## 5. Quality bar

Professional and modern: animations are smooth and purposeful, respect `prefers-reduced-motion`, work on a
phone (no horizontal scroll, 16 px side gutter) and keep the page light (no heavy libraries without reason).
Texts are short, concrete and correct in all three languages.

## 6. Source of truth

- Owner's decisions in this file; public-content rules in `SECURITY.md`; OAuth steps in
  `GOOGLE_OAUTH_NEXT_STEPS.md`; plan in `ROADMAP.md`.
- Company facts (what we make, numbers) come from the owner or Marina. Numbers on the site:
  «1 700+ projects since 2021» is from the project archive count on 2026-11-23 – update when they say so.
