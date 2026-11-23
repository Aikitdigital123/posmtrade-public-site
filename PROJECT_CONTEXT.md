# Kontext projektu pro dalšího Codexe

## Účel

Tento repozitář je výhradně veřejný statický web POSMTRADE (Vite + JavaScript, výstup jsou statické soubory). Slouží jako prezentace toho, co firma vyrábí, a obecná prezentace služby a jako veřejný zdroj domovské stránky, zásad ochrany soukromí a podmínek používání pro Google OAuth. Výchozí jazyk je ukrajinština, doplněná o českou a anglickou verzi.

Web bude použit při přechodu Google OAuth z režimu Testing do Production, aby platnost autorizace používané služby nebyla omezena týdenním testovacím režimem. Po přechodu se počítá s jedním novým udělením souhlasu.

## Povolené změny

- veřejné texty v angličtině, češtině a ukrajinštině o tom, co POSMTRADE dělá, a o účelu služby;
- přístupnost, responzivní vzhled, animace a statický výstup sestavený Vite;
- veřejné právní a informační stránky;
- GitHub Pages workflow, které sestaví a zkontroluje web (`npm run check`) a nasadí `dist/`;
- bezpečná dokumentace tohoto samostatného projektu.

## Zakázané změny

- klientská data, názvy klientů, e-mailové adresy, dokumenty nebo zakázky;
- přihlašovací údaje, tokeny, secrets, soubory `.env`, logy nebo neveřejné adresy;
- interní názvy, podrobnosti neveřejných systémů nebo provozní konfigurace;
- backend, databáze, formuláře, analytika, cookies nebo externí trackery;
- změny v jiných projektech nebo v běžících službách.

## Oddělení projektů

Budoucí klientský dashboard je samostatný soukromý projekt běžící lokálně. Není součástí GitHub Pages ani tohoto repozitáře. Později může být bezpečně zpřístupněn přes Cloudflare Tunnel. Veřejný web a soukromý dashboard musí zůstat oddělené a nesmějí sdílet citlivé hodnoty.
