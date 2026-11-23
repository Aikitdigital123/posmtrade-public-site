// A CSS-3D floor display that slowly turns, can be dragged, and comes apart/back together.
// Purely decorative: no WebGL, no library.
const W = 170; // width
const H = 310; // height of the sides
const D = 96; // depth
const shelfY = [-62, 4, 70, 136]; // shelf levels from the centre (y grows downwards)
const productColors = [
  ["#ff7a59", "#ffc94d", "#3ddc97"],
  ["#7c6cff", "#ff7a59", "#ffc94d"],
  ["#3ddc97", "#0b2540", "#ff7a59"],
  ["#ffc94d", "#7c6cff", "#3ddc97"],
];

function part(cls, w, h, transform, explode, extra = "") {
  return { cls, w, h, transform, explode, extra };
}

function buildParts() {
  const parts = [
    part("p-back", W, H, `translate3d(0,0,${-D / 2}px)`, [0, 0, -70]),
    part("p-side p-left", D, H, `translate3d(${-W / 2}px,0,0) rotateY(90deg)`, [-80, 0, 0]),
    part("p-side p-right", D, H, `translate3d(${W / 2}px,0,0) rotateY(90deg)`, [80, 0, 0]),
    part("p-edge", 14, H, `translate3d(${-W / 2}px,0,${D / 2}px)`, [-80, 0, 0]),
    part("p-edge", 14, H, `translate3d(${W / 2}px,0,${D / 2}px)`, [80, 0, 0]),
    part("p-topper", W + 24, 96, `translate3d(0,${-H / 2 - 40}px,${-D / 2 + 6}px)`, [0, -70, -40], "<i></i><b></b>"),
    part("p-base", W + 4, 34, `translate3d(0,${H / 2 - 17}px,${D / 2}px)`, [0, 50, 70], "<i></i>"),
  ];
  shelfY.forEach((y, i) => {
    const ex = [0, 0, 60 + i * 18];
    parts.push(part("p-shelf", W, D, `translate3d(0,${y}px,0) rotateX(90deg)`, ex));
    parts.push(part("p-strip", W + 4, 22, `translate3d(0,${y + 11}px,${D / 2}px)`, ex, "<i></i>"));
    productColors[i].forEach((color, j) => {
      const h = 34 + ((i + j) % 3) * 8;
      parts.push(
        part(
          "p-product",
          38,
          h,
          `translate3d(${(j - 1) * 50}px,${y - h / 2}px,${D / 6}px)`,
          [0, -30, 90 + i * 18],
          `<i style="background:${color}"></i>`,
        ),
      );
    });
  });
  return parts;
}

export function initStand3d(stage, { reduced }) {
  const stand = stage.querySelector(".stand3d");
  const parts = buildParts();
  stand.innerHTML = parts
    .map(
      (p, i) =>
        `<div class="${p.cls}" style="width:${p.w}px;height:${p.h}px;margin:${-p.h / 2}px 0 0 ${-p.w / 2}px;--i:${i}">${p.extra}</div>`,
    )
    .join("");
  const els = [...stand.children];

  let ry = -28;
  let rx = -12;
  let exploded = 0; // 0 = assembled, 1 = apart (animated)
  let explodeTarget = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let idle = 0;
  let visible = false;

  const apply = () => {
    stand.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    els.forEach((el, i) => {
      const [x, y, z] = parts[i].explode;
      const k = exploded;
      el.style.transform = `translate3d(${x * k}px,${y * k}px,${z * k}px) ${parts[i].transform}`;
    });
  };
  apply();
  if (reduced) return;

  stage.addEventListener("pointerdown", (e) => {
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

  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(stage);

  // Comes apart and back together every few seconds while visible.
  let clock = 0;
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(64, now - last);
    last = now;
    if (visible) {
      clock += dt;
      idle += dt;
      if (!dragging && idle > 1200) ry += dt * 0.018;
      const phase = clock % 9000;
      explodeTarget = phase > 4500 && phase < 7000 ? 1 : 0;
      exploded += (explodeTarget - exploded) * Math.min(1, dt * 0.004);
      apply();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
