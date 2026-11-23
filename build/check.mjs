// Safety check before every push (run by `npm run check` after the build).
// 1. Every public URL that Google OAuth and the agents' e-mail footer use still exists.
// 2. Every internal link and asset in the built pages points to a real file.
// 3. No secrets, private e-mail addresses or tokens slipped into the sources.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const base = "/posmtrade-public-site/";
const problems = [];

const required = ["index.html", "privacy.html", "terms.html"].flatMap((p) => [
  p,
  `uk/${p}`,
  `cs/${p}`,
  `en/${p}`,
]);
for (const p of required) if (!existsSync(join(dist, p))) problems.push(`missing page: ${p}`);

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

for (const file of walk(dist).filter((f) => f.endsWith(".html"))) {
  const htmlText = readFileSync(file, "utf8");
  for (const [, url] of htmlText.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) continue;
    const clean = url.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = clean.startsWith(base) ? join(dist, clean.slice(base.length)) : join(dirname(file), clean);
    if (!normalize(target).startsWith(dist) || !existsSync(target)) {
      problems.push(`broken link in ${relative(dist, file)}: ${url}`);
    }
  }
}

// Only the contact people listed in src/content/site.json may appear on the site.
const site = JSON.parse(readFileSync(join(root, "src/content/site.json"), "utf8"));
const allowedMail = new Set(site.people.map((p) => p.email));
const secretPatterns = [
  [/gh[pousr]_[A-Za-z0-9]{20,}/, "GitHub token"],
  [/sk-[A-Za-z0-9_-]{20,}/, "API key"],
  [/AIza[0-9A-Za-z_-]{30,}/, "Google API key"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/"(?:client_secret|refresh_token|access_token)"/, "OAuth secret"],
];
const sourceFiles = ["src", "public", "build"].flatMap((d) => walk(join(root, d)));
for (const file of sourceFiles) {
  if (!/\.(html|json|js|mjs|css|md|txt|svg)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const [re, what] of secretPatterns) if (re.test(text)) problems.push(`${what} in ${relative(root, file)}`);
  for (const [mail] of text.matchAll(/[\w.+-]+@[\w-]+\.[\w.]+/g)) {
    if (!allowedMail.has(mail) && !mail.startsWith("@fontsource")) problems.push(`e-mail address in ${relative(root, file)}: ${mail}`);
  }
}

// Internal agent names are not for the public (owner 2026-11-23): the site describes what the assistants do.
// (names that are also ordinary words – наліпка "sticker", мірка, крамар – are left out)
const INTERNAL_NAMES = /Галочк|Звітник|Форматинк|Візуальчик|Макетчик|Договірник|Вчасник|Конструктерчик|Технобро|Halo(?:ch|č)k|Zvitnyk|Formatynk|Vizual(?:ch|č)yk|Maket(?:ch|č)yk|Dohovirnyk|V(?:ch|č)asnyk|Technobro/u;
for (const file of walk(dist).filter((f) => f.endsWith(".html"))) {
  const m = readFileSync(file, "utf8").match(INTERNAL_NAMES);
  if (m) problems.push(`internal agent name "${m[0]}" in ${relative(dist, file)}`);
}

if (problems.length) {
  console.error(`check: ${problems.length} problem(s)\n - ${problems.join("\n - ")}`);
  process.exit(1);
}
console.log(`check: OK – ${required.length} required pages, links and sources clean`);
