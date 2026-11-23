# POSMTRADE – veřejný web

Veřejná prezentace POSMTRADE: co vyrábíme (kartonové displeje, stojany, POS materiály, etikety, obaly,
3D makety) a jak funguje naše automatizace. Zároveň veřejná domovská stránka, zásady ochrany soukromí
a podmínky pro Google OAuth. Výchozí jazyk ukrajinština, dále čeština a angličtina.

Web: <https://aikitdigital123.github.io/posmtrade-public-site/>
Správce: agent **Sajtik (Сайтік)** – viz `AGENTS.md` a `.claude/agents/sajtik.md`.

## Technika

- **Vite + čistý JavaScript**, žádný framework; písma Manrope a Unbounded přibalená přes `@fontsource`.
- Texty v `src/content/<jazyk>.json`, právní stránky v `src/content/legal/`; `build/render.mjs` z nich
  vygeneruje stránky do `pages/`, Vite je sestaví do `dist/`.
- Animace: skládající se stojan v úvodu, otáčivý 3D stojan (CSS 3D, dá se táhnout), odhalování při
  posunu, počítadla, běžící pás, linka procesu. Respektuje `prefers-reduced-motion`.

## Příkazy

```bash
npm install        # jednou
npm run dev        # náhled s živými změnami
npm run check      # build + kontrola stránek, odkazů a citlivých údajů (musí projít před pushem)
npm run preview    # náhled sestaveného webu
```

## Publikování

Push do `main` → GitHub Actions (`.github/workflows/pages.yml`) spustí `npm ci` a `npm run check`
a nasadí `dist/` na GitHub Pages.

Před commitem `SECURITY.md`; kroky pro Google OAuth v `GOOGLE_OAUTH_NEXT_STEPS.md`; logo v `docs/LOGO.md`.
