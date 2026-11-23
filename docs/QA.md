# Kontrola kvality webu (QA)

Každá změna projde `npm run check` (build, 12 povinných adres, odkazy, citlivé údaje) a `npm test`
(Playwright, počítač 1440 px + telefon Pixel 7). GitHub Actions spustí obojí před každým nasazením –
když něco selže, web se nenasadí a zpráva testů je v artefaktu `playwright-report`.

## Co testy hlídají (tests/)

| Oblast | Test |
|---|---|
| Adresy pro Google OAuth a patičku e-mailů | všech 12 stránek se načte bez chyb v konzoli, má jeden `h1` a odkaz na ochranu soukromí |
| Jazyky | `lang`, titulek, všech 6 sekcí, přepínač jazyků (UA / CZ / EN) |
| Mobil | žádné vodorovné posouvání; menu přes celou obrazovku (i po odscrollování), skok na sekci, zavření, Escape |
| Menu na počítači | „pilulka“ jede přesně pod položku |
| Hlavička | logo vždy, nápis POSMTRADE jen na počítači |
| 3D stojan – model | všechny díly, souměrnost, každé zboží stojí přesně na své polici a nedotkne se police nad sebou, spodní lišta nad soklem, patro (police + lišta + zboží) se při rozložení hýbe jako celek, patra se nepředbíhají |
| 3D stojan – v prohlížeči | složí se, tlačítko rozloží a složí, popisek odpovídá stavu, při rozložení zůstanou všechny díly v obraze z úhlů 0°, −40°, −90°, 180° |
| Projekty | 8 záložek, každá ukáže svůj panel, šipky na klávesnici, graf 2021–2026 |
| Kontakty | Marina a Gergel: telefon a e-mail jako odkazy, telefon kanceláře, tlačítko Kopírovat |
| Obsah | agenti jsou kreslené ikony (žádné fotky), obrázky mají `alt`, tlačítka mají název |
| Bez animací | při „omezit pohyb“ v systému je všechen obsah vidět |

## Ruční kontrola před větší změnou

1. `npm run dev` – projít stránku na počítači i v úzkém okně (390 px) ve všech třech jazycích.
2. Stojan: otočit myší, rozložit, složit; nic se neprolíná, nic neodletí z obrazu.
3. Projekty: kliknout na několik záložek; kontakty: Zavolat / Napsat / Kopírovat.
4. Nový prvek s animací = nový test v `tests/site.spec.js`.
