import "@fontsource-variable/manrope";
import "@fontsource-variable/unbounded";
import "./styles/main.css";
import { initStand3d } from "./stand3d.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

// Header: shadow after scrolling, progress bar, mobile menu.
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const onScroll = () => {
  const y = window.scrollY;
  header?.classList.toggle("is-scrolled", y > 12);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  updateSteps();
};

const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("main-nav");
toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
});
nav?.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    toggle?.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }
});

// Reveal on scroll (everything at once when the visitor prefers less motion).
if (reduced) document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
const revealed = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      revealed.unobserve(entry.target);
      const counter = entry.target.querySelector("[data-count]");
      if (counter) countUp(counter);
    }
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => revealed.observe(el));

// Numbers count up once they are visible.
function countUp(el) {
  const target = Number(el.dataset.count);
  const plain = el.dataset.plain === "1";
  const fmt = (n) => (plain ? String(n) : n.toLocaleString(document.documentElement.lang));
  if (reduced) return void (el.textContent = fmt(target));
  const from = plain ? target - 20 : 0;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / 1600);
    const eased = 1 - (1 - p) ** 3;
    el.textContent = fmt(Math.round(from + (target - from) * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Process line fills as the steps scroll through the viewport.
const steps = document.querySelector("[data-steps]");
const stepLine = steps?.querySelector(".steps-line span");
function updateSteps() {
  if (!steps || !stepLine) return;
  const r = steps.getBoundingClientRect();
  const vh = window.innerHeight;
  const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height || 1)));
  stepLine.style.setProperty("--p", p.toFixed(3));
  steps.querySelectorAll(".step").forEach((s, i, all) => s.classList.toggle("is-active", p >= (i + 0.35) / all.length));
}

// Cards: light follows the pointer; hero stand tilts slightly.
if (!reduced && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".service-card, .auto-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
  const visual = document.querySelector(".hero-visual");
  const hero = document.querySelector(".hero");
  hero?.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    visual?.style.setProperty("--tx", `${x * 14}px`);
    visual?.style.setProperty("--ty", `${y * 10}px`);
  });
  document.querySelectorAll(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}

const stage = document.querySelector("[data-stand3d]");
if (stage) initStand3d(stage, { reduced });

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();
