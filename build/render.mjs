// Generates the HTML pages in pages/ from the texts in src/content/.
// Texts are edited in src/content/<lang>.json and src/content/legal/; this file only builds the layout.
// Run by `npm run dev` and `npm run build` automatically.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { icons } from "./icons.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "pages");
const read = (p) => readFileSync(join(root, p), "utf8");
const site = JSON.parse(read("src/content/site.json"));
const langs = ["uk", "cs", "en"];
const t = Object.fromEntries(langs.map((l) => [l, JSON.parse(read(`src/content/${l}.json`))]));

// Directory of each language. Ukrainian is the default at the root; uk/ keeps older links working.
const variants = [
  { lang: "uk", dir: "" },
  { lang: "uk", dir: "uk/" },
  { lang: "cs", dir: "cs/" },
  { lang: "en", dir: "en/" },
];
const pageNames = ["index", "privacy", "terms"];

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// Fields that allow a little inline markup (<em>) are marked with html(); everything else is escaped.
const html = (s) => String(s).replace(/<(?!\/?em>)/g, "&lt;");

function langSwitch(lang, dir, page) {
  const up = dir ? "../" : "";
  const target = { uk: `${up}${page}.html`, cs: `${up}cs/${page}.html`, en: `${up}en/${page}.html` };
  return langs
    .map((l) => {
      const current = l === lang ? ' aria-current="page"' : "";
      return `<a href="${target[l]}" lang="${l}"${current}>${t[l].label}</a>`;
    })
    .join("");
}

function header(c, lang, dir, page) {
  const home = page === "index" ? "" : "index.html";
  const links = [
    ["services", c.nav.services],
    ["process", c.nav.process],
    ["mockup", c.nav.mockup],
    ["agents", c.nav.agents],
    ["contact", c.nav.contact],
  ]
    .map(([id, label]) => `<a href="${home}#${id}">${esc(label)}</a>`)
    .join("");
  return `
  <a class="skip-link" href="#content">${esc(c.nav.skip)}</a>
  <div class="scroll-progress" aria-hidden="true"></div>
  <header class="site-header" data-header>
    <a class="brand" href="index.html" aria-label="POSMTRADE — ${esc(c.nav.home)}">
      <img src="${site.logo}" alt="" width="40" height="40"><span>POSMTRADE</span>
    </a>
    <nav class="main-nav" id="main-nav" aria-label="${esc(c.nav.menu)}">${links}</nav>
    <div class="header-tools">
      <nav class="language-switch" aria-label="Language">${langSwitch(lang, dir, page)}</nav>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">
        <span class="sr-only">${esc(c.nav.menu)}</span><span></span><span></span>
      </button>
    </div>
  </header>`;
}

function footer(c) {
  return `
  <footer class="site-footer">
    <div class="footer-brand">
      <img src="${site.logo}" alt="" width="32" height="32">
      <div><strong>POSMTRADE</strong><p>${esc(c.footer.tagline)}</p></div>
    </div>
    <nav aria-label="Footer">
      <a href="index.html">${esc(c.nav.home)}</a>
      <a href="privacy.html">${esc(c.nav.privacy)}</a>
      <a href="terms.html">${esc(c.nav.terms)}</a>
    </nav>
    <span class="footer-rights">${esc(c.footer.rights)}</span>
  </footer>`;
}

const heroStand = `
<svg class="hero-stand" viewBox="0 0 440 540" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="g-side" x1="0" x2="1"><stop offset="0" stop-color="#0a8fd0"/><stop offset="1" stop-color="#056a9e"/></linearGradient>
    <linearGradient id="g-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2cc4f4"/><stop offset="1" stop-color="#0a8fd0"/></linearGradient>
    <linearGradient id="g-topper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d0ff"/><stop offset="1" stop-color="#0779b8"/></linearGradient>
  </defs>
  <ellipse class="s-shadow" cx="225" cy="512" rx="170" ry="16"/>
  <g class="s-part s-back"><rect x="118" y="150" width="190" height="320" rx="4" fill="#e6f6fd"/><path d="M118 150h190" stroke="#bfe6f7" stroke-width="2"/></g>
  <g class="s-part s-right"><path d="M318 150 372 118v322l-54 32z" fill="url(#g-side)"/><path d="M330 190 360 172M330 214 360 196" stroke="#ffffff55" stroke-width="6" stroke-linecap="round"/></g>
  <g class="s-part s-left"><rect x="100" y="146" width="20" height="326" rx="3" fill="url(#g-front)"/></g>
  <g class="s-part s-rightedge"><rect x="306" y="146" width="20" height="326" rx="3" fill="url(#g-front)"/></g>
  ${[0, 1, 2, 3]
    .map((i) => {
      const y = 232 + i * 76;
      const colors = [
        ["#ff7a59", "#ffc94d", "#ff7a59"],
        ["#3ddc97", "#0b2540", "#3ddc97"],
        ["#ffc94d", "#ff7a59", "#7c6cff"],
        ["#7c6cff", "#3ddc97", "#ffc94d"],
      ][i];
      const products = colors
        .map((col, j) => {
          const x = 134 + j * 58;
          const h = 34 + ((i + j) % 3) * 8;
          return `<g class="s-product" style="--d:${1.5 + i * 0.18 + j * 0.07}s"><rect x="${x}" y="${y - h}" width="44" height="${h}" rx="6" fill="${col}"/><rect x="${x + 8}" y="${y - h + 9}" width="28" height="5" rx="2.5" fill="#ffffff88"/></g>`;
        })
        .join("");
      return `<g class="s-part s-shelf" style="--d:${0.75 + i * 0.12}s">${products}<path d="M120 ${y}h186l12-8H132z" fill="#cdeefb"/><rect x="114" y="${y}" width="198" height="20" rx="3" fill="#0b2540"/><rect x="128" y="${y + 7}" width="70" height="6" rx="3" fill="#2cc4f4"/></g>`;
    })
    .join("")}
  <g class="s-part s-base"><rect x="98" y="470" width="230" height="30" rx="4" fill="#0b2540"/><rect x="118" y="481" width="120" height="8" rx="4" fill="#2cc4f4"/></g>
  <g class="s-part s-topper">
    <path d="M110 152V96c0-30 28-54 60-54h92c32 0 56 24 56 54v56z" fill="url(#g-topper)"/>
    <circle cx="160" cy="100" r="30" fill="#fff"/>
    <path d="M150 84h14a11 11 0 0 1 0 22h-6v12h-8z" fill="#0a8fd0"/>
    <rect x="202" y="84" width="88" height="10" rx="5" fill="#fff"/>
    <rect x="202" y="104" width="58" height="8" rx="4" fill="#ffffffaa"/>
  </g>
  <g class="s-badge s-badge-1"><rect x="8" y="190" width="78" height="40" rx="20" fill="#fff"/><text x="47" y="216" text-anchor="middle">3D</text></g>
  <g class="s-badge s-badge-2"><rect x="352" y="62" width="82" height="40" rx="20" fill="#fff"/><text x="393" y="88" text-anchor="middle">CMYK</text></g>
  <g class="s-badge s-badge-3"><circle cx="392" cy="470" r="24" fill="#3ddc97"/><path d="m381 470 8 8 15-16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
</svg>`;

function home(c) {
  const stats = c.stats
    .map(
      (s) => `<div class="stat reveal">
        <strong><span data-count="${s.value}"${s.plain ? ' data-plain="1"' : ""}>${s.value}</span>${esc(s.suffix)}</strong>
        <span>${esc(s.label)}</span>
      </div>`,
    )
    .join("");
  const services = c.services.items
    .map(
      (s, i) => `<article class="service-card reveal" style="--i:${i}">
        <div class="service-icon">${icons[s.icon] ?? ""}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </article>`,
    )
    .join("");
  const steps = c.process.steps
    .map(
      (s, i) => `<li class="step reveal" style="--i:${i}">
        <span class="step-num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </li>`,
    )
    .join("");
  const points = c.mockup.points.map((p) => `<li>${esc(p)}</li>`).join("");
  const materials = c.materials.map((m) => `<span>${esc(m)}</span>`).join("");
  const auto = c.agents.points
    .map(
      (p, i) => `<article class="auto-card reveal" style="--i:${i}">
        <span class="auto-num">0${i + 1}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
      </article>`,
    )
    .join("");
  // Avatar from public/agents/<key>.webp; without a file the agent gets a drawn badge with its initial.
  const agents = c.agents.items
    .map((a, i) => {
      const hasAvatar = existsSync(join(root, "public/agents", `${a.avatar}.webp`));
      const face = hasAvatar
        ? `<img src="/agents/${a.avatar}.webp" alt="" width="96" height="96" loading="lazy">`
        : `<span class="agent-badge">${esc(a.avatar === "maketchyk" ? "3D" : [...a.name.replace(/^Пані\s+/, "")][0])}</span>`;
      return `<article class="agent-card reveal" style="--i:${i % 5}">
        <div class="agent-face">${face}</div>
        <h3>${esc(a.name)}</h3>
        <span class="agent-role">${esc(a.role)}</span>
        <p>${esc(a.text)}</p>
      </article>`;
    })
    .join("");
  const ct = site.contact;
  const contactLines = [
    ct.email && `<a class="button" href="mailto:${esc(ct.email)}">${esc(c.contact.cta)}</a>`,
    ct.email && `<a class="contact-line" href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>`,
    ct.phone && `<a class="contact-line" href="tel:${esc(ct.phone.replace(/\s+/g, ""))}">${esc(ct.phone)}</a>`,
    ct.address && `<span class="contact-line">${esc(ct.address)}</span>`,
  ]
    .filter(Boolean)
    .join("");

  return `
  <main id="content">
    <section class="hero">
      <div class="hero-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="dieline"></span></div>
      <div class="hero-copy">
        <p class="eyebrow hero-in" style="--i:0">${esc(c.hero.eyebrow)}</p>
        <h1 class="hero-in" style="--i:1">${html(c.hero.title)}</h1>
        <p class="lead hero-in" style="--i:2">${esc(c.hero.lead)}</p>
        <div class="hero-links hero-in" style="--i:3">
          <a class="button magnetic" href="#services">${esc(c.hero.ctaPrimary)}</a>
          <a class="button ghost" href="#process">${esc(c.hero.ctaSecondary)}</a>
        </div>
      </div>
      <div class="hero-visual">${heroStand}</div>
    </section>

    <section class="stats" aria-label="POSMTRADE">${stats}</section>

    <section class="section" id="services">
      <div class="section-heading reveal">
        <p class="eyebrow">${esc(c.services.eyebrow)}</p>
        <h2>${esc(c.services.title)}</h2>
        <p class="section-intro">${esc(c.services.intro)}</p>
      </div>
      <div class="service-grid">${services}</div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">${materials}${materials}</div></div>

    <section class="section" id="process">
      <div class="section-heading reveal">
        <p class="eyebrow">${esc(c.process.eyebrow)}</p>
        <h2>${esc(c.process.title)}</h2>
      </div>
      <ol class="steps" data-steps><span class="steps-line" aria-hidden="true"><span></span></span>${steps}</ol>
    </section>

    <section class="section mockup" id="mockup">
      <div class="mockup-copy reveal">
        <p class="eyebrow">${esc(c.mockup.eyebrow)}</p>
        <h2>${esc(c.mockup.title)}</h2>
        <p>${esc(c.mockup.text)}</p>
        <ul class="check-list">${points}</ul>
      </div>
      <div class="mockup-stage reveal" data-stand3d aria-hidden="true">
        <div class="stand3d"></div>
        <div class="mockup-floor"></div>
      </div>
    </section>

    <section class="section automation" id="agents">
      <div class="section-heading reveal">
        <p class="eyebrow">${esc(c.agents.eyebrow)}</p>
        <h2>${esc(c.agents.title)}</h2>
        <p class="section-intro">${esc(c.agents.intro)}</p>
      </div>
      <div class="agent-grid">${agents}</div>
      <h3 class="principles-title reveal">${esc(c.agents.principlesTitle)}</h3>
      <div class="auto-grid">${auto}</div>
      <p class="auto-note reveal">${esc(c.agents.dataNote)}
        <a href="privacy.html">${esc(c.agents.privacyLink)}</a> · <a href="terms.html">${esc(c.agents.termsLink)}</a></p>
    </section>

    <section class="section contact" id="contact">
      <div class="contact-card reveal">
        <p class="eyebrow">${esc(c.contact.eyebrow)}</p>
        <h2>${esc(c.contact.title)}</h2>
        <p>${esc(c.contact.text)}</p>
        ${contactLines ? `<div class="contact-lines">${contactLines}</div>` : ""}
      </div>
    </section>
  </main>`;
}

function legal(lang, page) {
  return `
  <main class="document" id="content">
    <div class="document-inner reveal">${read(`src/content/legal/${lang}-${page}.html`)}</div>
  </main>`;
}

function render({ lang, dir }, page) {
  const c = t[lang];
  const up = dir ? "../" : "";
  const title = page === "index" ? c.meta.title : `${c.nav[page]} — POSMTRADE`;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(c.meta.description)}">
  <meta name="theme-color" content="#0a8fd0">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(c.meta.description)}">
  <title>${esc(title)}</title>
  <link rel="icon" type="image/png" href="${site.logo}">
  <link rel="apple-touch-icon" href="${site.logo}">
  <script type="module" src="${up}../src/main.js"></script>
</head>
<body class="page-${page}">
  ${header(c, lang, dir, page)}
  ${page === "index" ? home(c) : legal(lang, page)}
  ${footer(c)}
</body>
</html>
`;
}

rmSync(out, { recursive: true, force: true });
const inputs = [];
for (const v of variants) {
  for (const page of pageNames) {
    const file = join(out, v.dir, `${page}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, render(v, page));
    inputs.push(file);
  }
}
writeFileSync(join(out, "inputs.json"), JSON.stringify(inputs, null, 2));
console.log(`render: ${inputs.length} pages → pages/`);
