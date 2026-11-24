// Generates the HTML pages in pages/ from the texts in src/content/.
// Texts are edited in src/content/<lang>.json and src/content/legal/; this file only builds the layout.
// Run by `npm run dev` and `npm run build` automatically.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { agentIcons } from "./agent-icons.mjs";
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

// A one-letter word (в, з, і, v, s, a, …) never ends a line: it is glued to the next word.
const nb = (s) => String(s).replace(/(?<=^|[\s(«„"])([A-Za-zА-Яа-яІіЇїЄєҐґ]) /gu, "$1\u00a0");
const esc = (s) =>
  nb(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
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
    ["projects", c.nav.projects],
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

// Headings appear word by word: every word sits in a mask and slides up. <em> keeps its gradient.
function words(text, start = 0) {
  const tokens = nb(text).match(/<em>.*?<\/em>|[^ ]+/g) ?? [];
  let i = start;
  return tokens
    .map((tok) => {
      const em = tok.startsWith("<em>");
      const inner = em ? tok.slice(4, -5) : tok;
      return inner
        .split(/ +/)
        .map((w) => `<span class="w"><span class="${em ? "em" : ""}" style="--w:${i++}">${esc(w)}</span></span>`)
        .join(" ");
    })
    .join(" ");
}

// The 3D section shows the flat die-line being cut, printed and turned into a model.
const shelvesPrint = [0, 1, 2, 3]
  .map(
    (i) =>
      `<g style="--p:${3 + i}"><rect x="386" y="${62 + i * 66}" width="130" height="54" rx="2" fill="#dff4fd"/><rect x="386" y="${62 + i * 66}" width="130" height="16" fill="#0b2540"/><rect x="396" y="${67 + i * 66}" width="46" height="6" rx="3" fill="#2cc4f4"/></g>`,
  )
  .join("");
const shelvesCut = [0, 1, 2, 3]
  .map((i) => `<path pathLength="1" style="--c:${3 + i * 0.5}" d="M386 ${62 + i * 66}h130v54H386z"/>`)
  .join("");
const dieline = `
<svg class="dieline-svg" viewBox="0 0 540 430" aria-hidden="true">
  <defs>
    <linearGradient id="dl-side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2cc4f4"/><stop offset="1" stop-color="#0a8fd0"/></linearGradient>
    <linearGradient id="dl-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d0ff"/><stop offset="1" stop-color="#0779b8"/></linearGradient>
  </defs>
  <g class="dl-print">
    <rect style="--p:0" x="24" y="74" width="84" height="300" rx="2" fill="url(#dl-side)"/>
    <rect style="--p:1" x="120" y="56" width="150" height="318" rx="2" fill="#e6f6fd"/>
    <rect style="--p:2" x="282" y="74" width="84" height="300" rx="2" fill="url(#dl-side)"/>
    ${shelvesPrint}
    <g style="--p:7"><path d="M120 56V34c0-14 12-24 26-24h98c14 0 26 10 26 24v22z" fill="url(#dl-top)"/><circle cx="160" cy="34" r="14" fill="#fff"/><path d="M155 27h6a5 5 0 0 1 0 10h-2v6h-4z" fill="#0a8fd0"/><rect x="184" y="27" width="66" height="7" rx="3.5" fill="#fff"/></g>
    <g style="--p:8" fill="#ffffff66"><circle cx="66" cy="300" r="22"/><circle cx="324" cy="300" r="22"/><rect x="38" y="110" width="56" height="8" rx="4"/><rect x="296" y="110" width="56" height="8" rx="4"/></g>
  </g>
  <g class="dl-cut" fill="none" stroke="#0b2540" stroke-width="2.2" stroke-linejoin="round">
    <path pathLength="1" style="--c:0" d="M24 74h84v300H24z"/>
    <path pathLength="1" style="--c:1" d="M120 56h150v318H120zM120 56V34c0-14 12-24 26-24h98c14 0 26 10 26 24v22"/>
    <path pathLength="1" style="--c:2" d="M282 74h84v300h-84z"/>
    ${shelvesCut}
  </g>
  <g class="dl-fold" fill="none" stroke="#ff7a59" stroke-width="1.6" stroke-dasharray="6 5">
    <path d="M38 74v300M352 74v300M120 74h150M386 78h130M386 144h130M386 210h130M386 276h130"/>
  </g>
  <rect class="dl-laser" x="0" y="0" width="3" height="430" rx="1.5" fill="#ff7a59"/>
  <g class="dl-chip"><rect x="404" y="350" width="112" height="44" rx="22" fill="#0b2540"/><text x="460" y="378" text-anchor="middle">→ 3D</text></g>
</svg>`;

const ICON_PHONE = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>`;
const ICON_MAIL = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>`;

function home(c, lang) {
  const stats = c.stats
    .map(
      (s, i) => `<div class="stat reveal" style="--i:${i}">
        <strong><span data-count="${s.value}">${s.value}</span><em class="suffix">${esc(s.suffix)}</em></strong>
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
  // What the digital assistants do – by task, never by (internal) name.
  const agents = c.agents.items
    .map(
      (a, i) => `<article class="agent-card reveal" style="--i:${i % 5}">
        <div class="agent-face">${agentIcons[a.icon] ?? ""}</div>
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.text)}</p>
      </article>`,
    )
    .join("");

  // Recently delivered stands: a carousel of the current 3D views (side 3/4, front, back) with arrows, dots and swipe.
  const sc = c.projects.showcase;
  const VIEWS = ["right", "front", "back"];
  const showcase = sc.items
    .map(
      (p, i) => `<article class="case reveal" style="--i:${i}" data-carousel aria-roledescription="carousel" aria-label="${esc(p.name)} — ${esc(p.type)}">
        <div class="case-art">
          ${VIEWS.map(
            (v, k) =>
              `<img class="case-img${k === 0 ? " is-active" : ""}" src="/projects/${p.key}-${v}.webp" alt="${esc(p.name)} — ${esc(sc.views[k])}" width="640" height="800" loading="lazy"${k === 0 ? "" : ' aria-hidden="true"'}>`,
          ).join("")}
          <button class="case-nav case-prev" type="button" aria-label="${esc(sc.prev)}">‹</button>
          <button class="case-nav case-next" type="button" aria-label="${esc(sc.next)}">›</button>
          <div class="case-dots">${VIEWS.map(
            (_v, k) =>
              `<button type="button" class="case-dot${k === 0 ? " is-active" : ""}" aria-label="${esc(sc.views[k])}" aria-current="${k === 0}"></button>`,
          ).join("")}</div>
          <span class="case-view" aria-live="polite">${esc(sc.views[0])}</span>
        </div>
        <div class="case-info">
          <h4>${esc(p.name)}</h4>
          <p>${esc(p.type)}</p>
          <dl>
            <div><dt>${esc(sc.labels.size)}</dt><dd>${esc(p.size)}</dd></div>
            <div><dt>${esc(sc.labels.shelves)}</dt><dd>${esc(p.shelves)}</dd></div>
            <div><dt>${esc(sc.labels.date)}</dt><dd>${esc(p.date)}</dd></div>
          </dl>
        </div>
      </article>`,
    )
    .join("");

  // Projects: tabs with the project types (real counts from the project archive) + projects per year.
  const pt = c.projects.types;
  const tabs = pt
    .map(
      (t, i) => `<button class="proj-tab" type="button" role="tab" id="pt-${t.key}" aria-controls="pp-${t.key}" aria-selected="${i === 0}" data-i="${i}">
        <span class="proj-tab-label">${esc(t.label)}</span><span class="proj-tab-count">${esc(t.count)}</span><i class="proj-tab-bar"></i>
      </button>`,
    )
    .join("");
  const panels = pt
    .map(
      (t, i) => `<div class="proj-panel${i === 0 ? " is-active" : ""}" role="tabpanel" tabindex="0" id="pp-${t.key}" aria-labelledby="pt-${t.key}">
        <div class="proj-art">${(icons[t.key === "display" ? "floor" : t.key] ?? "").replaceAll("iso-shadow-", "iso-shadow-p-")}</div>
        <div class="proj-info"><strong class="proj-count">${esc(t.count)}</strong><span class="proj-unit">${esc(c.projects.unit)}</span>
        <h3>${esc(t.label)}</h3><p>${esc(t.text)}</p></div>
      </div>`,
    )
    .join("");
  const years = site.projectsByYear;
  const maxYear = Math.max(...years.map(([, n]) => n));
  const bars = years
    .map(
      ([y, n], i) => `<div class="year" style="--h:${((n / maxYear) * 100).toFixed(1)}%;--i:${i}">
        <span class="year-val">${n}</span><span class="year-bar"></span><span class="year-label">${y}${i === years.length - 1 ? `<small>${esc(c.projects.partial)}</small>` : ""}</span>
      </div>`,
    )
    .join("");

  // Contact: people from site.json, drawn initials instead of photos; call / write / copy.
  const telHref = (t) => `tel:${t.replace(/[^+\d]/g, "")}`;
  const people = site.people
    .map((p, i) => {
      const name = p.name[lang];
      const initials = name
        .split(/\s+/)
        .map((w) => [...w][0])
        .join("");
      return `<article class="person reveal" style="--i:${i}">
        <div class="person-avatar" aria-hidden="true"><span>${esc(initials)}</span></div>
        <div class="person-body">
          <h3>${esc(name)}</h3>
          <p class="person-role">${esc(p.role[lang])}</p>
          <a class="person-line" href="${telHref(p.phone)}">${ICON_PHONE}${esc(p.phone)}</a>
          <span class="person-line"><a href="mailto:${esc(p.email)}">${ICON_MAIL}${esc(p.email)}</a>
            <button class="copy" type="button" data-copy="${esc(p.email)}" data-done="${esc(c.contact.copied)}" aria-label="${esc(c.contact.copy)}: ${esc(p.email)}">${esc(c.contact.copy)}</button></span>
          <div class="person-actions">
            <a class="button small" href="${telHref(p.phone)}">${esc(c.contact.call)}</a>
            <a class="button small ghost" href="mailto:${esc(p.email)}">${esc(c.contact.write)}</a>
          </div>
        </div>
      </article>`;
    })
    .join("");
  const office = `<div class="office reveal"><strong>${esc(c.contact.office)}</strong>
      <a href="${telHref(site.office.phone)}">${esc(site.office.phone)}</a><span>${esc(site.office.address[lang])}</span></div>`;

  return `
  <main id="content">
    <section class="hero">
      <div class="hero-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="dieline"></span><span class="spot"></span></div>
      <div class="hero-copy">
        <p class="eyebrow hero-in" style="--i:0">${c.hero.eyebrow
          .split(" · ")
          .map((t) => `<span class="eb-seg">${esc(t)}</span>`)
          .join("")}</p>
        <h1 class="split">${words(c.hero.title)}</h1>
        <p class="lead hero-in" style="--i:3">${esc(c.hero.lead)}</p>
        <div class="hero-links hero-in" style="--i:4">
          <a class="button magnetic" href="#services">${esc(c.hero.ctaPrimary)}<span class="arrow" aria-hidden="true">→</span></a>
          <a class="button ghost" href="#process">${esc(c.hero.ctaSecondary)}</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="stand-stage" data-stand3d>
          <div class="stand3d" aria-hidden="true"></div>
          <div class="stage-floor" aria-hidden="true"></div>
          <span class="chip chip-1" aria-hidden="true">3D</span>
          <span class="chip chip-2" aria-hidden="true">CMYK</span>
          <span class="chip chip-3" aria-hidden="true">✓</span>
          <button class="stand-toggle" type="button" data-apart="${esc(c.hero.apart)}" data-together="${esc(c.hero.together)}">${esc(c.hero.apart)}</button>
        </div>
      </div>
      <a class="scroll-hint" href="#services" aria-label="${esc(c.hero.ctaPrimary)}"><span></span></a>
    </section>

    <section class="stats" aria-label="POSMTRADE">${stats}</section>

    <section class="section" id="services">
      <div class="section-heading reveal">
        <p class="eyebrow">${esc(c.services.eyebrow)}</p>
        <h2 class="split">${words(c.services.title)}</h2>
        <p class="section-intro">${esc(c.services.intro)}</p>
      </div>
      <div class="service-grid">${services}</div>
    </section>

    <section class="section" id="projects">
      <div class="section-heading reveal">
        <p class="eyebrow">${esc(c.projects.eyebrow)}</p>
        <h2 class="split">${words(c.projects.title)}</h2>
        <p class="section-intro">${esc(c.projects.intro)}</p>
      </div>
      <div class="proj reveal" data-projects>
        <div class="proj-tabs" role="tablist">${tabs}</div>
        <div class="proj-stage">${panels}</div>
      </div>
      <div class="cases">
        <div class="cases-head reveal"><h3>${esc(sc.title)}</h3><span>${esc(sc.hint)}</span></div>
        <div class="cases-grid">${showcase}</div>
      </div>
      <div class="years reveal">
        <div class="years-head"><h3>${esc(c.projects.yearsTitle)}</h3><span>${esc(c.projects.yearsNote)}</span></div>
        <div class="years-chart">${bars}</div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">${materials}${materials}</div></div>

    <section class="section" id="process">
      <div class="section-heading reveal">
        <p class="eyebrow">${esc(c.process.eyebrow)}</p>
        <h2 class="split">${words(c.process.title)}</h2>
      </div>
      <ol class="steps" data-steps><span class="steps-line" aria-hidden="true"><span></span></span>${steps}</ol>
    </section>

    <section class="section mockup" id="mockup">
      <div class="mockup-copy reveal">
        <p class="eyebrow">${esc(c.mockup.eyebrow)}</p>
        <h2 class="split">${words(c.mockup.title)}</h2>
        <p>${esc(c.mockup.text)}</p>
        <ul class="check-list">${points}</ul>
      </div>
      <div class="mockup-stage reveal">${dieline}</div>
    </section>

    <section class="section automation" id="agents">
      <div class="section-heading reveal">
        <p class="eyebrow">${esc(c.agents.eyebrow)}</p>
        <h2 class="split">${words(c.agents.title)}</h2>
        <p class="section-intro">${esc(c.agents.intro)}</p>
        <p class="proven-badge"><span aria-hidden="true">✓</span>${esc(c.agents.proven)}</p>
      </div>
      <div class="agent-grid">${agents}</div>
      <div class="agents-cta reveal">
        <div><h3>${esc(c.agents.cta.title)}</h3><p>${esc(c.agents.cta.text)}</p></div>
        <a class="button" href="#contact">${esc(c.agents.cta.button)}<span class="arrow" aria-hidden="true">→</span></a>
      </div>
      <h3 class="principles-title reveal split">${words(c.agents.principlesTitle)}</h3>
      <div class="auto-grid">${auto}</div>
      <p class="auto-note reveal">${esc(c.agents.dataNote)}
        <a href="privacy.html">${esc(c.agents.privacyLink)}</a> · <a href="terms.html">${esc(c.agents.termsLink)}</a></p>
    </section>

    <section class="section contact" id="contact">
      <div class="contact-card reveal">
        <p class="eyebrow">${esc(c.contact.eyebrow)}</p>
        <h2 class="split">${words(c.contact.title)}</h2>
        <p>${esc(c.contact.text)}</p>
      </div>
      <div class="people">${people}</div>
      ${office}
    </section>
  </main>`;
}

function legal(lang, page) {
  return `
  <main class="document" id="content">
    <div class="document-inner reveal">${read(`src/content/legal/${lang}-${page}.html`)}</div>
  </main>`;
}

const SITE = "https://aikitdigital123.github.io/posmtrade-public-site/";
const pathOf = (lang, page) => `${lang === "uk" ? "" : `${lang}/`}${page === "index" ? "" : `${page}.html`}`;

function render({ lang, dir }, page) {
  const c = t[lang];
  const up = dir ? "../" : "";
  const title = page === "index" ? c.meta.title : `${c.nav[page]} — POSMTRADE`;
  const description =
    page === "index"
      ? c.meta.description
      : (read(`src/content/legal/${lang}-${page}.html`).match(/<p class="lead">([^<]+)<\/p>/)?.[1] ?? c.meta.description);
  const alternates = langs
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${pathOf(l, page)}">`)
    .join("\n  ");
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}${pathOf(lang, page)}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${SITE}${pathOf("uk", page)}">
  <meta property="og:url" content="${SITE}${pathOf(lang, page)}">
  <meta name="theme-color" content="#0a8fd0">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <title>${esc(title)}</title>
  <link rel="icon" type="image/png" href="${site.logo}">
  <link rel="apple-touch-icon" href="${site.logo}">
  <script type="module" src="${up}../src/main.js"></script>
</head>
<body class="page-${page}">
  ${header(c, lang, dir, page)}
  ${page === "index" ? home(c, lang) : legal(lang, page)}
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
