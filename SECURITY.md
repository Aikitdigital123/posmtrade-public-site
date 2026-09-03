# Bezpečnostní pravidla

## Zakázaný obsah

Do repozitáře nepatří:

- klientská data, názvy klientů, e-mailové adresy, zakázky ani dokumenty;
- osobní údaje;
- přihlašovací údaje, hesla, API klíče, tokeny, certifikáty ani jiné secrets;
- soubory `.env` a jejich varianty se skutečnými hodnotami;
- interní názvy, neveřejné adresy, logy, technické chyby nebo provozní data;
- databázové exporty, zálohy a jiné soukromé soubory.

## Kontrola před commitem

1. Zkontrolujte celý výstup `git status`.
2. Zkontrolujte změny pomocí `git diff --staged`.
3. Vyhledejte omylem vložené soubory `.env`, tokeny, secrets a soukromé soubory.
4. Ověřte, že změny obsahují pouze obecné veřejné informace o službě.

Při podezření na únik tajné hodnoty ji nepoužívejte a ihned ji nahraďte novou; samotné odstranění z posledního commitu nestačí.
