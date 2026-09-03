# Kontext projektu pro dalšího Codexe

## Účel

Tento repozitář je výhradně veřejný statický web POSMTRADE. Slouží jako obecná prezentace služby a jako veřejný zdroj domovské stránky, zásad ochrany soukromí a podmínek používání pro Google OAuth.

Web bude použit při přechodu Google OAuth z režimu Testing do Production, aby platnost autorizace používané služby nebyla omezena týdenním testovacím režimem. Po přechodu se počítá s jedním novým udělením souhlasu.

## Povolené změny

- veřejné české texty o obecném účelu POSMTRADE;
- přístupnost, responzivní vzhled a čisté statické HTML/CSS;
- veřejné právní a informační stránky;
- GitHub Pages workflow pro obsah adresáře `site/`;
- bezpečná dokumentace tohoto samostatného projektu.

## Zakázané změny

- klientská data, názvy klientů, e-mailové adresy, dokumenty nebo zakázky;
- přihlašovací údaje, tokeny, secrets, soubory `.env`, logy nebo neveřejné adresy;
- interní názvy, podrobnosti neveřejných systémů nebo provozní konfigurace;
- backend, databáze, formuláře, analytika, cookies nebo externí trackery;
- změny v jiných projektech nebo v běžících službách.

## Oddělení projektů

Budoucí klientský dashboard je samostatný soukromý projekt běžící lokálně. Není součástí GitHub Pages ani tohoto repozitáře. Později může být bezpečně zpřístupněn přes Cloudflare Tunnel. Veřejný web a soukromý dashboard musí zůstat oddělené a nesmějí sdílet citlivé hodnoty.
