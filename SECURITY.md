# Bezpečnostní pravidla

## Zakázaný obsah

Do repozitáře nepatří:

- klientská data, názvy klientů, e-mailové adresy, zakázky ani dokumenty;
- osobní údaje, které nejsou nezbytné pro veřejný web;
- hesla, API klíče, tokeny, certifikáty nebo jiné secrets;
- skutečné soubory `.env` a jejich varianty;
- neveřejné adresy, interní názvy, logy, chybové výpisy nebo provozní data;
- databázové exporty, zálohy a jiné soukromé soubory;
- podrobnosti o neveřejných systémech.

## Kontrola před commitem

1. Zkontrolujte celý výstup `git status`.
2. Prohlédněte změny pomocí `git diff` a `git diff --staged`.
3. Vyhledejte omylem vložené `.env`, tokeny, secrets, klíče, logy a soukromé soubory.
4. Ověřte, že změny obsahují pouze obecné informace vhodné k veřejnému zveřejnění.
5. Ověřte, že commit neobsahuje změny mimo tento projekt.

Při podezření na únik tajné hodnoty ji okamžitě nahraďte novou. Samotné odstranění z posledního commitu nestačí.
