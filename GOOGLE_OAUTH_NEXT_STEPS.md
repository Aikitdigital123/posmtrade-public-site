# Další kroky pro Google OAuth

Nejprve zprovozněte GitHub Pages a ověřte, že jsou všechny tři níže uvedené stránky veřejně dostupné bez přihlášení.

## 1. Google Auth Platform → Branding

V příslušném Google Cloud projektu otevřete **Google Auth Platform → Branding** a vyplňte:

- **App name:** `POSMTRADE`;
- **User support email:** vlastní spravovanou kontaktní adresu vybranou v konzoli;
- **App logo:** volitelné; pokud jej přidáte, musí skutečně reprezentovat POSMTRADE;
- **Application home page:** URL domovské stránky níže;
- **Application privacy policy link:** URL zásad ochrany soukromí níže;
- **Application terms of service link:** URL podmínek níže;
- **Authorized domains:** kořen vlastní domény až po jejím ověření přes DNS;
- **Developer contact information:** vlastní spravovanou kontaktní adresu.

Google požaduje, aby produkční externí aplikace měla veřejnou domovskou stránku, zásady ochrany soukromí a podmínky na schválených doménách. Podrobnosti jsou v [oficiálním návodu pro Branding](https://support.google.com/cloud/answer/15549049).

## 2. URL z GitHub Pages

Po úspěšném nasazení použijte:

- **Homepage:** `https://aikitdigital123.github.io/posmtrade-public-site/`
- **Privacy policy:** `https://aikitdigital123.github.io/posmtrade-public-site/privacy.html`
- **Terms of service:** `https://aikitdigital123.github.io/posmtrade-public-site/terms.html`

Tyto adresy slouží jako dočasné veřejné URL. Pro finální produkční ověření Google požaduje doménu, jejíž vlastnictví lze ověřit. Po připojení vlastní domény proto nahraďte všechny tři adresy odpovídajícími URL na stejné vlastní doméně a jako **Authorized domain** vložte její kořen.

## 3. Ověření vlastní domény přes DNS

1. V Google Search Console přidejte **Domain property** pro kořen vlastní domény.
2. Zkopírujte TXT záznam, který Google vygeneruje.
3. Přidejte tento TXT záznam u správce DNS beze změny hodnoty.
4. Po načtení DNS klikněte v Search Console na **Verify**.
5. Kořen domény přidejte v Google Auth Platform mezi **Authorized domains**.

Ověření musí provést účet s odpovídajícím oprávněním v Google Cloud projektu. Viz [oficiální návod k ověření domény](https://support.google.com/cloud/answer/13804266).

## 4. Přepnutí z Testing do Production

1. Otevřete **Google Auth Platform → Audience**.
2. Zkontrolujte typ uživatelů, požadované rozsahy oprávnění a kontaktní údaje.
3. Klikněte na **Publish app** a potvrďte přechod do produkce.
4. Pokud Google vyžádá ověření brandingu nebo oprávnění, dokončete zobrazený proces před zveřejněním.

V režimu Testing autorizace testovacího uživatele standardně vyprší po sedmi dnech; stav **In production** vznikne po publikování aplikace. Viz [oficiální popis publikačního stavu](https://support.google.com/cloud/answer/15549945).

## 5. Nové jednorázové udělení oprávnění

Po přepnutí do Production jednou znovu spusťte autorizaci Gmailu a udělte aplikaci pouze potřebná oprávnění. Starou testovací autorizaci nepovažujte za trvalou.
