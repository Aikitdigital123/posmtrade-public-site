# POSMTRADE – veřejný web

Tento repozitář obsahuje veřejnou informační prezentaci služby POSMTRADE. Web srozumitelně vysvětluje, jak služba pomáhá oprávněným organizacím automatizovat zpracování e-mailů a dokumentů, a poskytuje veřejné stránky potřebné pro Google OAuth. Výchozí jazyk webu je ukrajinština; česká a anglická verze jsou dostupné jako samostatné statické stránky.

## Rozsah projektu

- pouze statické HTML a CSS v adresáři `site/`;
- žádný backend, databáze, formuláře, cookies, analytika ani externí trackery;
- žádná klientská data, přihlašovací údaje nebo neveřejné provozní informace;
- publikování pouze prostřednictvím GitHub Pages.

Soukromý klientský dashboard je jiný projekt. Běží lokálně, nepatří do tohoto repozitáře a nebude publikován přes GitHub Pages. Jeho případné budoucí zpřístupnění bude řešeno odděleně přes Cloudflare Tunnel.

## Struktura webu

- `site/index.html` – ukrajinská domovská stránka;
- `site/privacy.html` – ukrajinská ochrana soukromí;
- `site/terms.html` – ukrajinské podmínky používání;
- `site/cs/` – česká jazyková verze;
- `site/en/` – anglická jazyková verze;
- `site/uk/` – kompatibilní kopie ukrajinské verze pro dřívější odkazy;
- `site/styles.css` – společný responzivní vzhled.

## Lokální náhled

Otevřete `site/index.html` v prohlížeči nebo spusťte libovolný lokální server pro statické soubory s kořenem v adresáři `site/`.

## GitHub Pages

Workflow `.github/workflows/pages.yml` publikuje přesně obsah adresáře `site/` po změně větve `main`. V repozitáři je nutné jednorázově nastavit **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Očekávaná adresa je `https://aikitdigital123.github.io/posmtrade-public-site/`.

Před každým commitem postupujte podle `SECURITY.md`. Další kroky pro Google OAuth jsou v `GOOGLE_OAUTH_NEXT_STEPS.md`.
