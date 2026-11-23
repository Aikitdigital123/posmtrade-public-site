// CSS-3D floor display (no WebGL, no library) – the hero of the home page.
// Symmetric stand: back, two sides with front edges, four shelves with printed strips, a base and a topper.
// Products are small 3D boxes standing on the shelves. Every face is shaded from one light.
//
// Behaviour: assembles itself when first visible, turns slowly, can be dragged, and comes apart and back
// together (automatically every few seconds, or with the button). When apart, every shelf level –
// shelf, strip and its products – moves as ONE unit, so nothing passes through anything else.
//
// Geometry (px, centre of the stand = 0,0,0; y grows downwards, z towards the viewer):
const W = 170; // inner width
const H = 310; // height of sides and back: y from -155 to 155
const D = 96; // depth: z from -48 to 48
const BASE_H = 30; // base (plinth) at the bottom front: y 125..155
const STRIP_H = 22; // printed strip under the front edge of every shelf
const SHELVES = [-86, -24, 38, 100]; // shelf top surfaces; lowest strip ends at 122, above the base (125)
const PRODUCT = { w: 38, d: 30, z: 2, gap: 50 }; // three boxes per shelf, x = -50, 0, 50
const COLORS = [
  ["#ff7a59", "#ffc94d", "#3ddc97"],
  ["#7c6cff", "#ff7a59", "#ffc94d"],
  ["#3ddc97", "#0b2540", "#ff7a59"],
  ["#ffc94d", "#7c6cff", "#3ddc97"],
];
const productHeight = (level, j) => 34 + ((level + j) % 3) * 8; // 34 / 42 / 50 – always below the next shelf

// Where every group goes when the stand is apart (x, y, z).
const APART = {
  back: [0, 0, -90],
  side: (s) => [s * 100, 0, 0],
  topper: [0, -55, -60],
  base: [0, 36, 80],
  level: (i) => [0, (i - 1.5) * 22, 110], // levels spread a little vertically, all move forward together
  lift: -10, // products rise a little above their shelf when apart
  scale: 0.16, // the whole stand shrinks a little when apart, so every part stays in the frame
};

const LIGHT = normalize([-0.45, -0.6, 1]);

function normalize([x, y, z]) {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
}

// One flat face. t = place in the model, n = normal (for light), ex = offset when apart,
// intro = where it flies in from, delay = when (s).
function face(cls, w, h, t, n, ex, intro, delay, html = "", style = "") {
  return { cls, w, h, t, n, ex, intro, delay, html, style };
}

// A product box (front, two sides, top) standing on y = bottom.
function box(parts, cx, bottom, w, h, d, cz, color, ex, delay) {
  const cy = bottom - h / 2;
  const intro = [0, -40, 320];
  const s = `background:${color}`;
  parts.push(face("p-box p-box-front", w, h, `translate3d(${cx}px,${cy}px,${cz + d / 2}px)`, [0, 0, 1], ex, intro, delay, "<i></i>", s));
  parts.push(face("p-box", d, h, `translate3d(${cx - w / 2}px,${cy}px,${cz}px) rotateY(90deg)`, [1, 0, 0], ex, intro, delay, "", s));
  parts.push(face("p-box", d, h, `translate3d(${cx + w / 2}px,${cy}px,${cz}px) rotateY(90deg)`, [1, 0, 0], ex, intro, delay, "", s));
  parts.push(face("p-box p-box-top", w, d, `translate3d(${cx}px,${bottom - h}px,${cz}px) rotateX(90deg)`, [0, 1, 0], ex, intro, delay, "", s));
}

export function buildParts() {
  const p = [];
  p.push(face("p-back p-front-only", W, H, `translate3d(0,0,${-D / 2}px)`, [0, 0, 1], APART.back, [0, 0, -400], 0, "<i></i>"));
  // the outside of the back is plain board (seen when the stand turns round)
  p.push(face("p-rear p-front-only", W, H, `translate3d(0,0,${-D / 2}px) rotateY(180deg)`, [0, 0, 1], APART.back, [0, 0, -400], 0));
  for (const s of [-1, 1]) {
    const ex = APART.side(s);
    const intro = [s * 420, 0, 0];
    p.push(face("p-side", D, H, `translate3d(${(s * W) / 2}px,0,0) rotateY(90deg)`, [1, 0, 0], ex, intro, 0.25, "<i></i>"));
    p.push(face("p-edge", 14, H, `translate3d(${(s * W) / 2}px,0,${D / 2}px)`, [0, 0, 1], ex, intro, 0.25));
  }
  SHELVES.forEach((y, i) => {
    const ex = APART.level(i);
    const delay = 0.55 + i * 0.12;
    p.push(face("p-shelf", W, D, `translate3d(0,${y}px,0) rotateX(90deg)`, [0, 1, 0], ex, [0, 0, 520], delay));
    p.push(face("p-strip", W + 4, STRIP_H, `translate3d(0,${y + STRIP_H / 2}px,${D / 2}px)`, [0, 0, 1], ex, [0, 0, 520], delay, "<i></i><b></b>"));
    const exProduct = [ex[0], ex[1] + APART.lift, ex[2]];
    COLORS[i].forEach((color, j) => {
      box(p, (j - 1) * PRODUCT.gap, y, PRODUCT.w, productHeight(i, j), PRODUCT.d, PRODUCT.z, color, exProduct, 1.25 + i * 0.14 + j * 0.06);
    });
  });
  p.push(face("p-base", W + 4, BASE_H, `translate3d(0,${H / 2 - BASE_H / 2}px,${D / 2}px)`, [0, 0, 1], APART.base, [0, 300, 0], 1.0, "<i></i>"));
  const topperAt = `translate3d(0,${-H / 2 - 40}px,${-D / 2 + 6}px)`;
  p.push(face("p-topper p-front-only", W + 24, 96, topperAt, [0, 0, 1], APART.topper, [0, -420, 0], 2.0, "<i></i><b>POSMTRADE</b><u></u>"));
  p.push(face("p-topper-rear p-front-only", W + 24, 96, `${topperAt} rotateY(180deg)`, [0, 0, 1], APART.topper, [0, -420, 0], 2.0));
  return p;
}

const easeOutBack = (x) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;

export function initStand3d(stage, { reduced }) {
  const stand = stage.querySelector(".stand3d");
  const parts = buildParts();
  stand.innerHTML = parts
    .map(
      (q) =>
        `<div class="${q.cls}" style="width:${q.w}px;height:${q.h}px;margin:${-q.h / 2}px 0 0 ${-q.w / 2}px;${q.style}">${q.html}</div>`,
    )
    .join("");
  const els = [...stand.children];

  let ry = -30;
  let rx = -10;
  let apart = 0;
  let apartTarget = 0;
  let manual = null; // null = automatic cycle, true/false = the visitor's choice
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let idle = 2000;
  let visible = false;
  let started = false;
  let introStart = 0;
  let introDone = reduced;

  function shade(n) {
    const a = (ry * Math.PI) / 180;
    const b = (rx * Math.PI) / 180;
    const x1 = n[0] * Math.cos(a) + n[2] * Math.sin(a);
    const z1 = -n[0] * Math.sin(a) + n[2] * Math.cos(a);
    const y2 = n[1] * Math.cos(b) - z1 * Math.sin(b);
    const z2 = n[1] * Math.sin(b) + z1 * Math.cos(b);
    return (0.42 * (1 - Math.abs(x1 * LIGHT[0] + y2 * LIGHT[1] + z2 * LIGHT[2]))).toFixed(3);
  }

  function render(now) {
    const k = 1 - APART.scale * apart;
    stand.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${k},${k},${k})`;
    const t = (now - introStart) / 1000;
    let allIn = true;
    parts.forEach((q, i) => {
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
      els[i].style.transform = `translate3d(${x * apart + ix}px,${y * apart + iy}px,${z * apart + iz}px) ${q.t}`;
      els[i].style.opacity = op;
      els[i].style.setProperty("--shade", shade(q.n));
    });
    if (!introDone && allIn) introDone = true;
  }

  // Test hook: state of the stand for the Playwright tests.
  stage.standState = () => ({ apart, introDone, ry, rx, parts: parts.length });

  if (reduced) {
    render(performance.now());
    return { toggle: () => false };
  }

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
    lastX = e.clientX;
    lastY = e.clientY;
    idle = 0;
  });
  const stop = () => (dragging = false);
  stage.addEventListener("pointerup", stop);
  stage.addEventListener("pointercancel", stop);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !started) {
      started = true;
      introStart = performance.now();
    }
  }).observe(stage);

  let clock = 0;
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(64, now - last);
    last = now;
    if (visible && started) {
      clock += dt;
      idle += dt;
      if (!dragging && idle > 1200) ry += dt * 0.02;
      if (manual !== null) apartTarget = manual ? 1 : 0;
      else if (introDone) {
        const phase = clock % 11000;
        apartTarget = phase > 6000 && phase < 9000 ? 1 : 0;
      }
      apart += (apartTarget - apart) * Math.min(1, dt * 0.004);
      const isApart = apart > 0.5;
      if (isApart !== stage.classList.contains("is-apart")) {
        stage.classList.toggle("is-apart", isApart);
        stage.dispatchEvent(new CustomEvent("standchange", { detail: { apart: isApart } }));
      }
      render(now);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return {
    toggle() {
      manual = !(manual ?? apart > 0.5);
      return manual;
    },
    // Test hook: put the stand at a fixed angle and state (used by the Playwright detail checks).
    pose(angleY, angleX, apartValue) {
      ry = angleY;
      rx = angleX;
      manual = apartValue > 0.5;
      apart = apartValue;
      introDone = true;
      idle = -1e9;
      render(performance.now());
    },
  };
}
