// CSS-3D floor display (no WebGL, no library). Symmetric stand: two sides, back, four shelves with
// printed strips, a base and a topper; products are small 3D boxes. Every face is shaded from one light,
// so the stand reads as a solid object while it turns.
//
// mode "hero":   assembles itself on load, then sways gently and follows the pointer over the hero.
// mode "studio": turns all the way round, can be dragged, comes apart and back together (button too).
const W = 170;
const H = 310;
const D = 96;
const SHELVES = [-62, 4, 70, 136];
const COLORS = [
  ["#ff7a59", "#ffc94d", "#3ddc97"],
  ["#7c6cff", "#ff7a59", "#ffc94d"],
  ["#3ddc97", "#0b2540", "#ff7a59"],
  ["#ffc94d", "#7c6cff", "#3ddc97"],
];
const LIGHT = normalize([-0.45, -0.6, 1]);

function normalize([x, y, z]) {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
}

// One flat face of the model.
// t = position/rotation, n = face normal (for shading), ex = offset when apart, intro = where it flies in from.
function face(cls, w, h, t, n, ex, intro, delay, html = "", style = "") {
  return { cls, w, h, t, n, ex, intro, delay, html, style };
}

function box(parts, cx, cy, cz, w, h, d, color, ex, delay) {
  const intro = [0, -260, 0];
  const s = `background:${color}`;
  parts.push(face("p-box p-box-front", w, h, `translate3d(${cx}px,${cy}px,${cz + d / 2}px)`, [0, 0, 1], ex, intro, delay, "<i></i>", s));
  parts.push(face("p-box", d, h, `translate3d(${cx - w / 2}px,${cy}px,${cz}px) rotateY(90deg)`, [1, 0, 0], ex, intro, delay, "", s));
  parts.push(face("p-box", d, h, `translate3d(${cx + w / 2}px,${cy}px,${cz}px) rotateY(90deg)`, [1, 0, 0], ex, intro, delay, "", s));
  parts.push(face("p-box p-box-top", w, d, `translate3d(${cx}px,${cy - h / 2}px,${cz}px) rotateX(90deg)`, [0, 1, 0], ex, intro, delay, "", s));
}

function buildParts() {
  const p = [];
  p.push(face("p-back", W, H, `translate3d(0,0,${-D / 2}px)`, [0, 0, 1], [0, 0, -80], [0, 0, -400], 0, "<i></i>"));
  for (const side of [-1, 1]) {
    const ex = [side * 90, 0, 0];
    const intro = [side * 420, 0, 0];
    p.push(face("p-side", D, H, `translate3d(${(side * W) / 2}px,0,0) rotateY(90deg)`, [1, 0, 0], ex, intro, 0.25, "<i></i>"));
    p.push(face("p-edge", 14, H, `translate3d(${(side * W) / 2}px,0,${D / 2}px)`, [0, 0, 1], ex, intro, 0.25));
  }
  SHELVES.forEach((y, i) => {
    const ex = [0, 0, 70 + i * 22];
    const intro = [0, 0, 520];
    const delay = 0.55 + i * 0.12;
    p.push(face("p-shelf", W, D, `translate3d(0,${y}px,0) rotateX(90deg)`, [0, 1, 0], ex, intro, delay));
    p.push(face("p-strip", W + 4, 22, `translate3d(0,${y + 11}px,${D / 2}px)`, [0, 0, 1], ex, intro, delay, "<i></i><b></b>"));
    COLORS[i].forEach((color, j) => {
      const h = 34 + ((i + j) % 3) * 8;
      box(p, (j - 1) * 50, y - h / 2 - 0.5, 4, 38, h, 30, color, [0, -24, 100 + i * 22], 1.25 + i * 0.14 + j * 0.06);
    });
  });
  p.push(face("p-base", W + 4, 34, `translate3d(0,${H / 2 - 17}px,${D / 2}px)`, [0, 0, 1], [0, 60, 80], [0, 300, 0], 1.0, "<i></i>"));
  p.push(
    face(
      "p-topper",
      W + 24,
      96,
      `translate3d(0,${-H / 2 - 40}px,${-D / 2 + 6}px)`,
      [0, 0, 1],
      [0, -80, -50],
      [0, -420, 0],
      2.0,
      '<i></i><b>POSMTRADE</b><u></u>',
    ),
  );
  return p;
}

const easeOutBack = (x) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;

export function initStand3d(stage, { reduced, mode = "studio", host = stage } = {}) {
  const stand = stage.querySelector(".stand3d");
  const parts = buildParts();
  stand.innerHTML = parts
    .map(
      (q) =>
        `<div class="${q.cls}" style="width:${q.w}px;height:${q.h}px;margin:${-q.h / 2}px 0 0 ${-q.w / 2}px;${q.style}">${q.html}</div>`,
    )
    .join("");
  const els = [...stand.children];
  const hero = mode === "hero";

  let ry = hero ? -24 : -30;
  let rx = -10;
  let targetRy = ry;
  let targetRx = rx;
  let apart = 0;
  let apartTarget = 0;
  let manual = null; // studio: null = automatic cycle, true/false = visitor's choice
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let idle = 2000;
  let visible = true;
  let introStart = performance.now();
  let introDone = reduced;

  function shade(n) {
    // rotate the normal like the stand: first around Y, then around X
    const a = (ry * Math.PI) / 180;
    const b = (rx * Math.PI) / 180;
    const x1 = n[0] * Math.cos(a) + n[2] * Math.sin(a);
    const z1 = -n[0] * Math.sin(a) + n[2] * Math.cos(a);
    const y2 = n[1] * Math.cos(b) - z1 * Math.sin(b);
    const z2 = n[1] * Math.sin(b) + z1 * Math.cos(b);
    const d = Math.abs(x1 * LIGHT[0] + y2 * LIGHT[1] + z2 * LIGHT[2]);
    return (0.42 * (1 - d)).toFixed(3);
  }

  function render(now) {
    stand.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    const t = (now - introStart) / 1000;
    let allIn = true;
    parts.forEach((q, i) => {
      const el = els[i];
      let ix = 0;
      let iy = 0;
      let iz = 0;
      let op = 1;
      if (!introDone) {
        const k = Math.min(1, Math.max(0, (t - q.delay) / 0.9));
        if (k < 1) allIn = false;
        const e = 1 - easeOutBack(k);
        [ix, iy, iz] = q.intro.map((v) => v * e);
        op = Math.min(1, k * 3);
      }
      const [x, y, z] = q.ex;
      el.style.transform = `translate3d(${x * apart + ix}px,${y * apart + iy}px,${z * apart + iz}px) ${q.t}`;
      el.style.opacity = op;
      el.style.setProperty("--shade", shade(q.n));
    });
    if (!introDone && allIn) introDone = true;
  }

  if (reduced) {
    render(performance.now());
    return { toggle() {} };
  }

  // Pointer: drag to turn (studio), or follow the pointer over the hero.
  if (hero) {
    host.addEventListener("pointermove", (e) => {
      const r = host.getBoundingClientRect();
      targetRy = -24 + ((e.clientX - r.left) / r.width - 0.5) * 50;
      targetRx = -10 - ((e.clientY - r.top) / r.height - 0.5) * 14;
      idle = 0;
    });
    host.addEventListener("pointerleave", () => (idle = 2000));
  } else {
    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      ry += (e.clientX - lastX) * 0.5;
      rx = Math.max(-40, Math.min(20, rx - (e.clientY - lastY) * 0.3));
      targetRy = ry;
      targetRx = rx;
      lastX = e.clientX;
      lastY = e.clientY;
      idle = 0;
    });
    const stop = () => (dragging = false);
    stage.addEventListener("pointerup", stop);
    stage.addEventListener("pointercancel", stop);
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    // the studio stand assembles itself the first time it scrolls into view
    if (visible && !hero && !stage.dataset.seen) {
      stage.dataset.seen = "1";
      introStart = performance.now();
      introDone = false;
    }
  }).observe(stage);
  if (!hero) introDone = false;

  let clock = 0;
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(64, now - last);
    last = now;
    if (visible) {
      clock += dt;
      idle += dt;
      if (hero) {
        if (idle > 1500) {
          targetRy = -24 + Math.sin(clock / 2600) * 26;
          targetRx = -10 + Math.sin(clock / 3900) * 4;
        }
        ry += (targetRy - ry) * Math.min(1, dt * 0.004);
        rx += (targetRx - rx) * Math.min(1, dt * 0.004);
      } else {
        if (!dragging && idle > 1200) ry += dt * 0.02;
        if (manual === null && introDone) {
          const phase = clock % 10000;
          apartTarget = phase > 5000 && phase < 7800 ? 1 : 0;
        } else if (manual !== null) {
          apartTarget = manual ? 1 : 0;
        }
        apart += (apartTarget - apart) * Math.min(1, dt * 0.004);
        stage.classList.toggle("is-apart", apart > 0.5);
      }
      if (stage.dataset.seen || hero) render(now);
    }
    requestAnimationFrame(tick);
  };
  render(now0());
  requestAnimationFrame(tick);

  return {
    toggle() {
      manual = !(manual ?? apart > 0.5);
      return manual;
    },
  };
}

function now0() {
  return performance.now();
}
