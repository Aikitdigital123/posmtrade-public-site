# Kontext projektu

Tento repozitář slouží výhradně jako veřejný statický web POSMTRADE. Nesmí obsahovat klientská data, přihlašovací údaje, tajné hodnoty ani neveřejné technické podrobnosti.

Práce v tomto repozitáři nesmí měnit ani ovlivňovat žádný běžící agentní systém.

Největším budoucím cílem je zabezpečený Agent Control Dashboard. Dashboard není součástí tohoto webu ani GitHub Pages. Jde o oddělenou lokálně provozovanou aplikaci s API a PostgreSQL, která má být později bezpečně zpřístupněna samostatně přes Cloudflare Tunnel a chráněna heslem a Google Authenticator.

Veřejný web a dashboard musí používat oddělené subdomény. Nikdy nesmějí sdílet databázi, přihlašovací údaje ani secrets.
