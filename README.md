# POSMTRADE – veřejný web

Tento repozitář obsahuje jednoduchou veřejnou prezentaci služby POSMTRADE pro účely informování uživatelů a ověření Google OAuth.

Web je tvořen pouze statickými soubory HTML a CSS v adresáři `site/`. Neobsahuje backend, databázi, formuláře, cookies, analytiku ani externí trackery.

## Lokální náhled

Otevřete soubor `site/index.html` v prohlížeči nebo spusťte libovolný lokální server pro statické soubory s kořenem v adresáři `site/`.

## Publikování

Workflow v `.github/workflows/pages.yml` publikuje obsah adresáře `site/` na GitHub Pages po změně větve `main`. V nastavení repozitáře musí být jako zdroj GitHub Pages zvoleno **GitHub Actions**.

Před každým zveřejněním postupujte podle `SECURITY.md`.
