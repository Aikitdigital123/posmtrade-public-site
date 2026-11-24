import "@fontsource-variable/manrope";
import "@fontsource-variable/unbounded";
import "./styles/main.css";
import { initStand3d } from "./stand3d.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
document.documentElement.classList.add("js");
requestAnimationFrame(() => document.documentElement.classList.add("is-loaded"));

// ---------- Header: shadow, progress bar, mobile menu ----------
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("main-nav");
const setMenu = (open) => {
  toggle?.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
};
toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav?.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

// Current section is highlighted in the menu.
const navLinks = [...document.querySelectorAll(".main-nav a")];
const sections = navLinks.map((a) => document.querySelector(a.hash)).filter(Boolean);
const sectionSpy = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      navLinks.forEach((a) => a.classList.toggle("is-current", a.hash === `#${e.target.id}`));
      if (!nav?.matches(":hover")) restPill();
    }
  },
  { rootMargin: "-45% 0px -50% 0px" },
);
sections.forEach((s) => sectionSpy.observe(s));

// Desktop menu: a pill slides under the hovered item and rests on the current section.
const pill = document.createElement("span");
pill.className = "nav-pill";
pill.setAttribute("aria-hidden", "true");
nav?.prepend(pill);
const movePill = (a) => {
  if (!a || window.matchMedia("(max-width: 920px)").matches) return void pill.classList.remove("is-on");
  pill.style.width = `${a.offsetWidth}px`;
  pill.style.transform = `translateX(${a.offsetLeft}px)`;
  pill.classList.add("is-on");
};
const restPill = () => movePill(navLinks.find((a) => a.classList.contains("is-current")));
navLinks.forEach((a) => {
  a.addEventListener("pointerenter", () => movePill(a));
  a.addEventListener("focus", () => movePill(a));
});
nav?.addEventListener("pointerleave", restPill);
window.addEventListener("resize", restPill);

// ---------- Reveal on scroll ----------
const revealAll = () => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
if (reduced) revealAll();
const revealer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      revealer.unobserve(entry.target);
      const counter = entry.target.querySelector("[data-count]");
      if (counter) countUp(counter);
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

function countUp(el) {
  const target = Number(el.dataset.count);
  const fmt = (n) => n.toLocaleString(document.documentElement.lang);
  if (reduced) return void (el.textContent = fmt(target));
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / 1800);
    el.textContent = fmt(Math.round(target * (1 - (1 - p) ** 4)));
    if (p < 1) requestAnimationFrame(step);
    else el.closest(".stat")?.classList.add("is-done");
  };
  requestAnimationFrame(step);
}

// ---------- Hero: 3D stand ----------
const stage = document.querySelector("[data-stand3d]");
if (stage) {
  const stand = initStand3d(stage, { reduced });
  stage.stand = stand; // used by the Playwright tests
  const btn = stage.querySelector(".stand-toggle");
  // The label always says what the button will do next (also when the stand comes apart by itself).
  const label = (apart) => {
    btn.textContent = apart ? btn.dataset.together : btn.dataset.apart;
    btn.setAttribute("aria-pressed", String(apart));
  };
  btn?.addEventListener("click", () => label(stand.toggle()));
  stage.addEventListener("standchange", (e) => btn && label(e.detail.apart));
}

// ---------- Projects: tabs that play by themselves until the visitor picks one ----------
const proj = document.querySelector("[data-projects]");
if (proj) {
  const tabs = [...proj.querySelectorAll(".proj-tab")];
  const panels = [...proj.querySelectorAll(".proj-panel")];
  let current = 0;
  let auto = !reduced;
  let timer = 0;
  let inView = false;
  const DURATION = 4200;
  const show = (i, focus = false) => {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach((t, j) => {
      t.setAttribute("aria-selected", String(j === current));
      t.tabIndex = j === current ? 0 : -1;
    });
    panels.forEach((p, j) => p.classList.toggle("is-active", j === current));
    const row = tabs[current].parentElement;
    if (row.scrollWidth > row.clientWidth + 2) {
      const t = tabs[current];
      row.scrollTo({ left: t.offsetLeft - (row.clientWidth - t.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
    }
    if (focus) tabs[current].focus({ preventScroll: true });
    proj.style.setProperty("--run", "0");
    timer = 0;
  };
  tabs.forEach((t, i) =>
    t.addEventListener("click", () => {
      auto = false;
      proj.classList.add("is-manual");
      show(i);
    }),
  );
  proj.querySelector(".proj-tabs").addEventListener("keydown", (e) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    const to = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : d ? current + d : null;
    if (to === null) return;
    e.preventDefault();
    auto = false;
    proj.classList.add("is-manual");
    show(to, true);
  });
  proj.addEventListener("pointerenter", () => proj.classList.add("is-paused"));
  proj.addEventListener("pointerleave", () => proj.classList.remove("is-paused"));
  new IntersectionObserver(([e]) => (inView = e.isIntersecting)).observe(proj);
  let prev = performance.now();
  const loop = (now) => {
    const dt = now - prev;
    prev = now;
    if (auto && inView && !proj.classList.contains("is-paused")) {
      timer += dt;
      proj.style.setProperty("--run", (timer / DURATION).toFixed(3));
      if (timer >= DURATION) show(current + 1);
    }
    requestAnimationFrame(loop);
  };
  show(0);
  if (auto) requestAnimationFrame(loop);
}

// ---------- Delivered stands: carousel of the 3D views (arrows, dots, swipe, auto-advance while visible) ----------
const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll("[data-carousel]").forEach((c) => {
  const imgs = [...c.querySelectorAll(".case-img")];
  const dots = [...c.querySelectorAll(".case-dot")];
  const label = c.querySelector(".case-view");
  let at = 0;
  let timer = null;
  const go = (k) => {
    at = (k + imgs.length) % imgs.length;
    imgs.forEach((im, j) => {
      im.classList.toggle("is-active", j === at);
      im.toggleAttribute("aria-hidden", j !== at);
    });
    dots.forEach((d, j) => {
      d.classList.toggle("is-active", j === at);
      d.setAttribute("aria-current", String(j === at));
    });
    if (label) label.textContent = dots[at]?.getAttribute("aria-label") || "";
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const start = () => {
    if (still || timer) return;
    timer = setInterval(() => go(at + 1), 3500);
  };
  c.querySelector(".case-prev").addEventListener("click", () => (stop(), go(at - 1)));
  c.querySelector(".case-next").addEventListener("click", () => (stop(), go(at + 1)));
  dots.forEach((d, j) => d.addEventListener("click", () => (stop(), go(j))));
  let x0 = null;
  c.addEventListener("pointerdown", (e) => (x0 = e.clientX));
  c.addEventListener("pointerup", (e) => {
    if (x0 !== null && Math.abs(e.clientX - x0) > 40) (stop(), go(at + (e.clientX < x0 ? 1 : -1)));
    x0 = null;
  });
  c.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") (stop(), go(at + 1));
    if (e.key === "ArrowLeft") (stop(), go(at - 1));
  });
  c.addEventListener("mouseenter", stop);
  new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()), { threshold: 0.4 }).observe(c);
});

// ---------- Copy e-mail ----------
document.querySelectorAll("[data-copy]").forEach((b) => {
  const label = b.textContent;
  b.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      b.textContent = b.dataset.done;
      b.classList.add("is-done");
      setTimeout(() => {
        b.textContent = label;
        b.classList.remove("is-done");
      }, 1800);
    } catch {
      window.location.href = `mailto:${b.dataset.copy}`;
    }
  });
});

// ---------- Scroll-driven effects ----------
const steps = document.querySelector("[data-steps]");
const stepLine = steps?.querySelector(".steps-line");
const heroVisual = document.querySelector(".hero-visual");
const marquee = document.querySelector(".marquee-track");
let marqueeX = 0;
let lastScroll = window.scrollY;
let velocity = 0;

function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle("is-scrolled", y > 12);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (!reduced && heroVisual && window.innerWidth > 920 && y < window.innerHeight * 1.2) heroVisual.style.translate = `0 ${y * 0.1}px`;
  else if (heroVisual) heroVisual.style.translate = "";
  // at the very top no menu item is "current"
  if (y < 200) {
    navLinks.forEach((a) => a.classList.remove("is-current"));
    if (!nav?.matches(":hover")) restPill();
  }
  if (steps && stepLine) {
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / (r.height || 1)));
    stepLine.style.setProperty("--p", p.toFixed(3));
    steps.querySelectorAll(".step").forEach((s, i, all) => s.classList.toggle("is-active", p >= (i + 0.3) / all.length));
  }
}

// Marquee runs on its own and speeds up / leans with the scroll speed.
let marqueeVisible = true;
if (marquee) new IntersectionObserver(([e]) => (marqueeVisible = e.isIntersecting)).observe(marquee);
function marqueeLoop() {
  const y = window.scrollY;
  velocity += (y - lastScroll - velocity) * 0.12;
  lastScroll = y;
  if (marquee && marqueeVisible) {
    const half = marquee.scrollWidth / 2;
    marqueeX -= 0.6 + Math.min(14, Math.abs(velocity) * 0.35);
    if (marqueeX <= -half) marqueeX += half;
    marquee.style.transform = `translateX(${marqueeX}px) skewX(${Math.max(-4, Math.min(4, -velocity * 0.25))}deg)`;
  }
  requestAnimationFrame(marqueeLoop);
}
if (!reduced) requestAnimationFrame(marqueeLoop);

// ---------- Pointer effects (desktop only) ----------
if (!reduced && finePointer) {
  // Cards tilt towards the pointer and a soft light follows it.
  document.querySelectorAll(".service-card, .auto-card, .agent-card, .stat, .person").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      card.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
      card.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });

  // Spotlight in the hero background.
  const hero = document.querySelector(".hero");
  hero?.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--sx", `${e.clientX - r.left}px`);
    hero.style.setProperty("--sy", `${e.clientY - r.top}px`);
  });

  // Buttons are pulled slightly towards the pointer.
  document.querySelectorAll(".magnetic, .contact-card .button").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.2}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
    });
    b.addEventListener("pointerleave", () => (b.style.translate = ""));
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();
