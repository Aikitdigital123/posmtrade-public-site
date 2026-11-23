// Product illustrations drawn with the isometric renderer (build/iso.mjs) in the colours of the 3D stand.
// Units are roughly centimetres of a small model; every scene lists its boxes back to front.
import { box, project, shadow, shade, svg } from "./iso.mjs";

const BLUE = "#2cc4f4";
const BLUE2 = "#0a8fd0";
const NAVY = "#0b2540";
const BOARD = "#eef8fd";
const INNER = "#dbeff8";
const CORAL = "#ff7a59";
const AMBER = "#ffc94d";
const MINT = "#3ddc97";
const VIOLET = "#7c6cff";
const WHITE = "#ffffff";

const g = (cls, body) => `<g${cls ? ` class="${cls}"` : ""}>${body}</g>`;

// Small "P" logo on a white disc, in face coordinates (centre u,v; radius r).
const logo = (face, u, v, r) => [
  { face, circle: [u, v, r], color: WHITE },
  { face, rect: [u - r * 0.32, v - r * 0.58, u - r * 0.06, v + r * 0.5], color: BLUE2 },
  { face, rect: [u - r * 0.06, v - r * 0.02, u + r * 0.38, v + r * 0.5], color: BLUE2 },
  { face, rect: [u - r * 0.06, v + r * 0.14, u + r * 0.16, v + r * 0.32], color: WHITE },
];

// A product box with a printed band.
function product(x, y, z, w, h, d, color) {
  return box(x, y, z, w, h, d, color, {
    decals: [
      { face: "front", rect: [w * 0.18, h * 0.55, w * 0.82, h * 0.72], color: WHITE, opacity: 0.75 },
      { face: "right", rect: [d * 0.2, h * 0.55, d * 0.8, h * 0.72], color: WHITE, opacity: 0.45 },
    ],
  });
}

// Board in the x-y plane (a sign, a topper): outline path in (u right, v up), thickness towards the viewer.
function slab(x, y, z, path, thick, color, decals = []) {
  const at = (zz) => path.map(([u, v]) => project([x + u, y + v, zz]).map((n) => n.toFixed(2)).join(",")).join(" ");
  let out = `<polygon points="${at(z)}" fill="${shade(color, -0.3)}"/>`;
  out += `<polygon points="${at(z + thick)}" fill="${color}"/>`;
  for (const d of decals) {
    const p = d.rect
      ? [[d.rect[0], d.rect[1]], [d.rect[2], d.rect[1]], [d.rect[2], d.rect[3]], [d.rect[0], d.rect[3]]]
      : d.circle
        ? Array.from({ length: 24 }, (_, i) => [d.circle[0] + d.circle[2] * Math.cos((i / 24) * 2 * Math.PI), d.circle[1] + d.circle[2] * Math.sin((i / 24) * 2 * Math.PI)])
        : d.path;
    out += `<polygon points="${p.map(([u, v]) => project([x + u, y + v, z + thick + 0.01]).map((n) => n.toFixed(2)).join(",")).join(" ")}" fill="${d.color}"${d.opacity ? ` opacity="${d.opacity}"` : ""}/>`;
  }
  return out;
}

const arch = (w, h, r) => {
  const pts = [[0, 0], [w, 0], [w, h - r]];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    pts.push([w / 2 + (w / 2) * Math.cos(a), h - r + r * Math.sin(a)]);
  }
  pts.push([0, h - r]);
  return pts;
};

// ---------- Floor display: sides, back, 4 shelves with strips and products, base, topper ----------
export function floorDisplay() {
  const W = 40;
  const D = 24;
  const H = 92;
  const levels = [12, 31, 50, 69];
  const colors = [
    [CORAL, AMBER, MINT],
    [VIOLET, CORAL, AMBER],
    [MINT, NAVY, CORAL],
    [AMBER, VIOLET, MINT],
  ];
  const body =
    box(3, 0, 0, W - 6, H - 2, 2, BOARD, {
      decals: [0, 1, 2, 3, 4, 5].map((i) => ({ face: "front", rect: [4 + i * 5, H - 10, 6.5 + i * 5, H - 6], color: "#cfeaf6" })),
    }) +
    box(0, 0, 0, 3, H, D, BLUE2, { right: INNER, front: BLUE }) +
    box(3, 0, D - 6, W - 6, 9, 6, NAVY, { decals: [{ face: "front", rect: [3, 3, 18, 5.4], color: BLUE }] });
  const lv = levels
    .map((y, i) => {
      const shelf = box(3, y - 2, 2, W - 6, 2, D - 2, "#f6fcff");
      const prods = colors[i]
        .map((c, j) => product(6 + j * 10.5, y, 8, 8, 10 + ((i + j) % 3) * 2.5, 9, c))
        .join("");
      const strip = box(3, y - 6, D - 2, W - 6, 6, 2, NAVY, {
        decals: [
          { face: "front", rect: [3, 2.2, 16, 3.8], color: BLUE },
          { face: "front", rect: [27, 1.6, 31.5, 4.4], color: AMBER },
        ],
      });
      return g("i-lvl", shelf + g("i-rise", prods) + strip);
    })
    .reverse(); // bottom level first, so every upper strip is drawn in front of the products below it
  const right = box(W - 3, 0, 0, 3, H, D, BLUE2, {
    front: BLUE,
    decals: [
      { face: "right", path: [[0, 22], [D, 36], [D, 48], [0, 34]], color: VIOLET, opacity: 0.55 },
      { face: "right", circle: [D / 2, 66, 6], color: WHITE, opacity: 0.35 },
      { face: "right", rect: [4, 80, 18, 83], color: WHITE, opacity: 0.8 },
      { face: "right", rect: [4, 75, 13, 77], color: WHITE, opacity: 0.5 },
    ],
  });
  const topper = slab(2, H - 3, 1, arch(W - 4, 26, 9), 2, BLUE, [
    ...logo("front", 9, 12, 6.5).map((d) => ({ ...d, face: undefined })),
    { rect: [18, 14, 32, 16.5], color: WHITE },
    { rect: [18, 9.5, 28, 11.5], color: WHITE, opacity: 0.7 },
  ]);
  return svg("floor", [shadow(0, 0, W, D, 10), g("", body), ...lv, g("i-pop", topper), g("", right)], [[0, 0, 0, W, H + 24, D]]);
}

// ---------- Counter display: tray, printed header, two rows of products, front lip ----------
export function counterDisplay() {
  const W = 40;
  const D = 26;
  const back = box(1, 3, 1, W - 2, 40, 2.5, BLUE, {
    decals: [
      { face: "front", path: [[0, 6], [W - 2, 17], [W - 2, 23], [0, 12]], color: VIOLET, opacity: 0.5 },
      ...logo("front", 8, 30, 6),
      { face: "front", rect: [17, 31, 33, 33.5], color: WHITE },
      { face: "front", rect: [17, 27, 28, 29], color: WHITE, opacity: 0.7 },
    ],
  });
  const tray = box(0, 0, 0, W, 3, D, NAVY);
  const left = box(1, 3, 3.5, 2, 12, D - 4.5, BLUE2, { right: INNER, front: BLUE });
  const rows = [6, 15]
    .map((z, r) =>
      [0, 1, 2, 3]
        .map((k) => product(5 + k * 8, 3, z, 6, 15 - r * 2 + ((k + r) % 2) * 2, 6.5, [CORAL, AMBER, MINT, VIOLET][(k + r) % 4]))
        .join(""),
    )
    .join("");
  const lip = box(3, 3, D - 3.5, W - 6, 9, 2, BLUE, {
    decals: [
      { face: "front", rect: [3, 3, 19, 5.4], color: WHITE },
      { face: "front", rect: [25, 2.4, 30.5, 6.4], color: AMBER },
    ],
  });
  const right = box(W - 3, 3, 3.5, 2, 12, D - 4.5, BLUE2, { front: BLUE, decals: [{ face: "right", rect: [3, 4, 15, 6.5], color: WHITE, opacity: 0.7 }] });
  return svg("table", [shadow(0, 0, W, D, 8), g("", tray), g("i-pop", back), g("", left), g("i-rise", rows), g("", lip), g("", right)], [[0, 0, 0, W, 43, D]]);
}

// ---------- Toppers and branding: short display with a big shaped topper and printed sides ----------
export function topperBranding() {
  const W = 40;
  const D = 22;
  const H = 46;
  const body =
    box(3, 0, 0, W - 6, H - 2, 2, BOARD) +
    box(0, 0, 0, 3, H, D, BLUE2, { right: INNER, front: BLUE }) +
    box(3, 0, D - 6, W - 6, 8, 6, NAVY, { decals: [{ face: "front", rect: [3, 2.8, 18, 5], color: AMBER }] });
  const lv = [26, 11]
    .map((y, i) =>
      g(
        "i-lvl",
        box(3, y - 2, 2, W - 6, 2, D - 2, "#f6fcff") +
          g("i-rise", [0, 1, 2].map((j) => product(6 + j * 10.5, y, 7, 8, 11 + ((i + j) % 2) * 3, 8, [CORAL, MINT, VIOLET, AMBER][(i + j) % 4])).join("")) +
          box(3, y - 6, D - 2, W - 6, 6, 2, NAVY, { decals: [{ face: "front", rect: [3, 2.2, 16, 3.8], color: BLUE }] }),
      ),
    )
    .reverse();
  const right = box(W - 3, 0, 0, 3, H, D, BLUE2, {
    front: BLUE,
    decals: [
      { face: "right", path: [[0, 8], [D, 18], [D, 30], [0, 20]], color: AMBER, opacity: 0.85 },
      { face: "right", circle: [D / 2, 36, 4.5], color: WHITE, opacity: 0.5 },
    ],
  });
  // the big topper: arch with a burst behind the logo
  const burst = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 ? 9 : 14;
    const a = (i / 16) * Math.PI * 2;
    return [20 + r * Math.cos(a), 26 + r * Math.sin(a)];
  });
  const topper = slab(-2, H - 3, 1, arch(W + 4, 44, 22), 2.4, BLUE, [
    { path: burst, color: AMBER },
    ...logo("front", 20, 26, 8.5).map((d) => ({ ...d, face: undefined })),
    { rect: [8, 6, 36, 9.5], color: WHITE },
    { rect: [13, 2.5, 31, 4.5], color: WHITE, opacity: 0.7 },
  ]);
  return svg("topper", [shadow(0, 0, W, D, 9), g("", body), g("i-pop", topper), ...lv, g("", right)], [[-2, 0, 0, W + 2, H + 42, D]]);
}

// ---------- Shelf strips: a shop shelf with printed strips, price tags and a wobbler ----------
export function shelfStrips() {
  const W = 52;
  const D = 18;
  const back = box(0, 0, 0, W, 40, 2, "#e3ebf1", { decals: [{ face: "front", rect: [0, 38, W, 40], color: "#cbd8e1" }] });
  const shelves = [21, 4]
    .map((y, i) => {
      const board = box(0, y - 2, 2, W, 2, D - 2, "#f7f9fb");
      const prods = [0, 1, 2, 3, 4]
        .map((k) => product(3 + k * 10, y, 6, 7, 11 + ((k + i) % 3) * 2, 7, [AMBER, CORAL, VIOLET, MINT, CORAL][(k + i) % 5]))
        .join("");
      const strip = box(0, y - 7, D - 0.5, W, 7, 1.5, BLUE, {
        decals: [
          { face: "front", rect: [2, 2.4, 18, 4.6], color: WHITE },
          { face: "front", rect: [22, 1.6, 29, 5.4], color: NAVY },
          { face: "front", rect: [33, 2.4, 44, 4.6], color: WHITE, opacity: 0.7 },
          { face: "front", rect: [46, 1.6, 50.5, 5.4], color: AMBER },
        ],
      });
      return g("i-lvl", board + g("i-rise", prods) + strip);
    })
    .reverse();
  // wobbler: round sign on a clear stem, standing out in front of the upper strip
  const wobbler = slab(36, 22, D + 4, [[0.6, -6], [1.4, -6], [1.4, 0], [0.6, 0]], 0.4, "#bfe6f7") +
    slab(31, 16, D + 4, Array.from({ length: 24 }, (_, i) => [6 + 6 * Math.cos((i / 24) * 2 * Math.PI), 6 + 6 * Math.sin((i / 24) * 2 * Math.PI)]), 0.8, CORAL, [
      { rect: [2.5, 5, 9.5, 7.2], color: WHITE },
      { rect: [3.5, 3, 8.5, 4.2], color: WHITE, opacity: 0.7 },
    ]);
  return svg("shelf", [shadow(0, 0, W, D, 6), g("", back), ...shelves, g("i-swing", wobbler)], [[0, 0, 0, W, 40, D + 6]]);
}

// ---------- Labels and marking: a parcel with a printed label and a sheet of stickers ----------
export function labelsMarking() {
  const KRAFT = "#e9c79a";
  const parcel = box(0, 0, 0, 30, 24, 22, KRAFT, {
    decals: [
      { face: "top", rect: [13, 0, 17, 22], color: "#d7ad78" },
      { face: "front", rect: [4, 5, 24, 19], color: WHITE },
      { face: "front", rect: [4, 15.5, 24, 19], color: BLUE2 },
      ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ face: "front", rect: [6 + i * 1.6, 7, 6.8 + i * 1.6 + (i % 3 ? 0 : 0.5), 12.5], color: NAVY })),
      { face: "front", rect: [6, 13.2, 16, 14.3], color: "#9fb6c6" },
      { face: "right", rect: [5, 9, 17, 17], color: WHITE },
      { face: "right", rect: [5, 14.5, 17, 17], color: CORAL },
      { face: "right", rect: [7, 10.5, 13, 12], color: NAVY, opacity: 0.6 },
    ],
  });
  // sticker sheet lying in front, with a grid of round labels; one is peeling up
  const sheet = box(-4, 0, 26, 30, 0.8, 18, WHITE, {
    top: WHITE,
    decals: [0, 1, 2].flatMap((r) =>
      [0, 1, 2, 3].map((c) => ({ face: "top", circle: [4.5 + c * 7, 3.5 + r * 5.5, 2.3], color: [BLUE, AMBER, MINT, VIOLET][(r + c) % 4] })),
    ),
  });
  const peel = slab(24, 0.8, 34, Array.from({ length: 24 }, (_, i) => [2.3 + 2.3 * Math.cos((i / 24) * 2 * Math.PI), 4 + 2.3 * Math.sin((i / 24) * 2 * Math.PI)]), 0.4, CORAL);
  return svg("label", [shadow(-4, 0, 34, 44, 6), g("i-pop", parcel), g("i-rise", sheet), g("i-swing", peel)], [[-4, 0, 0, 30, 24, 44]]);
}

// ---------- Shipping packaging: a printed box with tape, a second box and flat-packed boards ----------
export function shippingBox() {
  // flat-packed printed display, leaning behind the boxes
  const flat = box(-2, 0, 0, 2.2, 30, 26, BLUE2, {
    right: BLUE,
    front: BLUE2,
    decals: [
      { face: "right", path: [[0, 6], [26, 14], [26, 20], [0, 12]], color: VIOLET, opacity: 0.5 },
      { face: "right", circle: [18, 24, 3.2], color: WHITE, opacity: 0.6 },
      { face: "right", rect: [4, 24, 12, 25.6], color: WHITE },
    ],
  });
  const back = box(4, 0, 2, 22, 16, 18, BLUE2, {
    decals: [
      { face: "top", rect: [9.5, 0, 12.5, 18], color: NAVY, opacity: 0.85 },
      { face: "front", rect: [3, 5, 12, 7.5], color: WHITE, opacity: 0.8 },
    ],
  });
  const main = box(10, 0, 18, 28, 22, 20, BLUE, {
    decals: [
      { face: "top", rect: [12.5, 0, 15.5, 20], color: NAVY },
      { face: "front", rect: [11, 15, 17, 22], color: NAVY },
      ...logo("front", 6.5, 14, 4),
      { face: "front", rect: [3, 4, 14, 6.2], color: WHITE },
      { face: "front", rect: [3, 7.8, 10, 9.4], color: WHITE, opacity: 0.7 },
      // "this side up" arrows
      { face: "right", path: [[6, 8], [8, 12], [10, 8], [8.8, 8], [8.8, 5], [7.2, 5], [7.2, 8]], color: WHITE },
      { face: "right", path: [[12, 8], [14, 12], [16, 8], [14.8, 8], [14.8, 5], [13.2, 5], [13.2, 8]], color: WHITE },
      { face: "right", rect: [5, 15, 17, 17], color: WHITE, opacity: 0.6 },
    ],
  });
  return svg("box", [shadow(-2, 0, 40, 38, 6, "box"), g("", flat), g("i-rise", back), g("i-pop", main)], [[-2, 0, 0, 38, 30, 38]]);
}

// ---------- Projects ----------
const WOOD = "#c99a62";

function pallet(x, z, w, d) {
  return box(x, 0, z, w, 4, d, WOOD, {
    decals: [
      { face: "front", rect: [3, 0, 7, 2.6], color: "#7a5530" },
      { face: "front", rect: [w / 2 - 2, 0, w / 2 + 2, 2.6], color: "#7a5530" },
      { face: "front", rect: [w - 7, 0, w - 3, 2.6], color: "#7a5530" },
      { face: "right", rect: [3, 0, 7, 2.6], color: "#6b4a2a" },
      { face: "right", rect: [d - 7, 0, d - 3, 2.6], color: "#6b4a2a" },
    ],
  });
}

// Pallet skirt (баркета): a printed band around a pallet of products.
export function barketa() {
  const W = 40;
  const D = 30;
  const stock = [0, 1, 2]
    .flatMap((r) => [0, 1, 2].map((c) => product(2 + c * 12.5, 4, 2 + r * 9.5, 11, 24 + ((r + c) % 2) * 3, 8.5, [CORAL, AMBER, MINT, VIOLET][(r + c) % 4])))
    .join("");
  const skirt = box(0, 4, 0, W, 16, D, BLUE, {
    noTop: true,
    decals: [
      { face: "front", path: [[0, 2], [W, 8], [W, 13], [0, 7]], color: VIOLET, opacity: 0.55 },
      ...logo("front", 7, 9, 5),
      { face: "front", rect: [16, 9, 34, 11.5], color: WHITE },
      { face: "front", rect: [16, 5.5, 27, 7.2], color: WHITE, opacity: 0.7 },
      { face: "right", rect: [4, 6, 26, 9], color: AMBER },
      { face: "right", circle: [22, 13, 2.2], color: WHITE, opacity: 0.6 },
    ],
  });
  return svg("barketa", [shadow(0, 0, W, D, 8, "barketa"), g("", pallet(0, 0, W, D)), g("i-rise", stock), g("i-pop", skirt)], [[0, 0, 0, W, 34, D]]);
}

// Standee: a character cut from board, with a back support and a base.
export function figure() {
  const body = [[4, 0], [24, 0], [23, 30], [28, 44], [25, 46], [20, 36], [20, 48], [8, 48], [8, 36], [3, 46], [0, 44], [5, 30]];
  const head = Array.from({ length: 28 }, (_, i) => [14 + 9 * Math.cos((i / 28) * 2 * Math.PI), 57 + 9 * Math.sin((i / 28) * 2 * Math.PI)]);
  const support = box(10, 0, 0, 8, 30, 1.2, "#d6e4ec");
  const base = box(-2, 0, 0, 32, 3, 10, NAVY);
  const fig =
    slab(0, 3, 6, body, 1.6, BLUE, [
      { rect: [8, 14, 20, 30], color: WHITE },
      ...logo("front", 14, 24, 4.5).map((d) => ({ ...d, face: undefined })),
      { rect: [9.5, 16, 18.5, 18], color: BLUE2 },
    ]) +
    slab(0, 3, 6, head, 1.6, AMBER, [
      { circle: [10.5, 59, 1.4], color: NAVY },
      { circle: [17.5, 59, 1.4], color: NAVY },
      { path: [[10, 53.5], [18, 53.5], [16.5, 51.5], [11.5, 51.5]], color: CORAL },
    ]) +
    slab(22, 50, 6, Array.from({ length: 20 }, (_, i) => [5 + 5 * Math.cos((i / 20) * 2 * Math.PI), 5 + 5 * Math.sin((i / 20) * 2 * Math.PI)]), 1.2, CORAL, [{ rect: [2, 4, 8, 6], color: WHITE }]);
  return svg("figure", [shadow(-2, 0, 32, 12, 8, "figure"), g("", base), g("", support), g("i-pop", fig)], [[-2, 0, 0, 32, 66, 12]]);
}

// Decoration: a store zone on a podium – garland between two posts, a star standee and gift boxes.
export function decoration() {
  const podium = box(0, 0, 0, 46, 3, 30, NAVY, { decals: [{ face: "front", rect: [3, 1, 20, 2], color: BLUE }] });
  const postL = box(1, 3, 2, 2, 44, 2, BLUE2, { front: BLUE });
  const postR = box(43, 3, 2, 2, 44, 2, BLUE2, { front: BLUE });
  // garland hangs in a curve between the posts
  const sag = (u) => 46 - 5 * Math.sin((u / 42) * Math.PI);
  const line = `<polyline points="${Array.from({ length: 22 }, (_, i) => 2 + i * 2)
    .map((u) => project([u, sag(u - 2), 3]).map((n) => n.toFixed(2)).join(","))
    .join(" ")}" fill="none" stroke="${NAVY}" stroke-width=".8"/>`;
  const flags = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const u = 6 + i * 6.4;
      const top = sag(u - 2 + 2.5);
      return slab(u, top - 8, 3, [[0, 8], [5, 8], [5, 0], [2.5, 2.8], [0, 0]], 0.5, [CORAL, AMBER, MINT, VIOLET, BLUE, CORAL][i]);
    })
    .join("");
  const star = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 5.5 : 12;
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    return [12 + r * Math.cos(a), 13 - r * Math.sin(a)];
  });
  const starStand = box(8, 3, 9, 8, 2, 5, BLUE2) + slab(0, 5, 11, star, 1.6, AMBER, [{ circle: [12, 13, 3.2], color: WHITE, opacity: 0.6 }]);
  const gifts =
    box(28, 3, 10, 12, 10, 10, CORAL, {
      decals: [
        { face: "front", rect: [5, 0, 7, 10], color: WHITE },
        { face: "top", rect: [5, 0, 7, 10], color: WHITE },
        { face: "right", rect: [4, 0, 6, 10], color: WHITE },
      ],
    }) +
    box(31, 13, 13, 7, 5, 6, MINT, { decals: [{ face: "front", rect: [2.5, 0, 4.5, 5], color: WHITE }, { face: "top", rect: [2.5, 0, 4.5, 6], color: WHITE }] }) +
    box(30, 3, 21, 9, 7, 7, VIOLET, { decals: [{ face: "front", rect: [3.5, 0, 5.5, 7], color: AMBER }, { face: "top", rect: [3.5, 0, 5.5, 7], color: AMBER }] });
  return svg(
    "decoration",
    [shadow(0, 0, 46, 30, 6, "decoration"), g("", podium), g("", postL), g("i-swing", line + flags), g("i-pop", starStand), g("i-rise", gifts), g("", postR)],
    [[0, 0, 0, 46, 48, 30]],
  );
}

// Pallet frame (обрамлення): posts and a printed header around a pallet of products.
export function palletFrame() {
  const W = 40;
  const D = 30;
  const stock = [0, 1, 2]
    .flatMap((r) => [0, 1, 2].map((c) => product(3 + c * 12, 4, 3 + r * 9, 10, 18 + ((r + c) % 2) * 4, 8, [MINT, CORAL, AMBER, VIOLET][(r + c) % 4])))
    .join("");
  const postL = box(-1, 4, D - 4, 3, 40, 3, BLUE2, { front: BLUE });
  const postR = box(W - 2, 4, D - 4, 3, 40, 3, BLUE2, { front: BLUE, decals: [{ face: "right", rect: [0.5, 6, 2.5, 30], color: WHITE, opacity: 0.5 }] });
  const header = box(-1, 40, D - 4, W + 2, 12, 3, BLUE, {
    decals: [
      ...logo("front", 7, 6, 4.5),
      { face: "front", rect: [15, 6.5, 36, 9], color: WHITE },
      { face: "front", rect: [15, 3, 28, 4.8], color: WHITE, opacity: 0.7 },
    ],
  });
  const lip = box(0, 4, D - 1, W, 6, 1, NAVY, { decals: [{ face: "front", rect: [3, 2, 20, 4], color: BLUE }] });
  return svg("pallet", [shadow(-1, 0, W + 2, D, 8, "pallet"), g("", pallet(0, 0, W, D)), g("i-rise", stock), g("", postL + lip), g("", postR), g("i-pop", header)], [[-1, 0, 0, W + 1, 52, D]]);
}

// Tray: a low shelf tray with a printed front and products standing in rows.
export function tray() {
  const W = 40;
  const D = 22;
  const base = box(0, 0, 0, W, 2, D, BLUE2);
  const backWall = box(0, 2, 0, W, 8, 2, BLUE, { decals: [{ face: "front", rect: [3, 3, 37, 5], color: WHITE, opacity: 0.5 }] });
  const left = box(0, 2, 2, 2, 8, D - 2, BLUE2, { right: INNER, front: BLUE });
  const rows = [4, 12]
    .map((z, r) => [0, 1, 2, 3].map((k) => product(4 + k * 8.5, 2, z, 7, 15 + ((k + r) % 2) * 3, 6, [AMBER, CORAL, MINT, VIOLET][(k + r) % 4])).join(""))
    .join("");
  const front = box(2, 2, D - 2, W - 4, 10, 2, BLUE, {
    decals: [
      { face: "front", path: [[0, 0], [W - 4, 0], [W - 4, 4], [0, 7]], color: NAVY, opacity: 0.85 },
      ...logo("front", 6, 6.5, 2.6),
      { face: "front", rect: [11, 7, 26, 8.6], color: WHITE },
      { face: "front", rect: [28, 1.2, 33, 3.2], color: AMBER },
    ],
  });
  const right = box(W - 2, 2, 2, 2, 8, D - 2, BLUE2, { front: BLUE });
  return svg("tray", [shadow(0, 0, W, D, 8, "tray"), g("", base + backWall + left), g("i-rise", rows), g("", front), g("", right)], [[0, 0, 0, W, 20, D]]);
}

// Cube / island: a big printed cube with products on top.
export function cube() {
  const S2 = 32;
  const body = box(0, 0, 0, S2, S2, S2, BLUE, {
    decals: [
      { face: "front", path: [[0, 6], [S2, 14], [S2, 20], [0, 12]], color: VIOLET, opacity: 0.5 },
      ...logo("front", 9, 23, 5.5),
      { face: "front", rect: [17, 23, 29, 25.5], color: WHITE },
      { face: "front", rect: [17, 19.5, 25, 21.2], color: WHITE, opacity: 0.7 },
      { face: "right", circle: [16, 18, 8], color: AMBER },
      { face: "right", rect: [9, 6, 23, 8.5], color: WHITE },
      { face: "right", rect: [12, 2.5, 20, 4], color: WHITE, opacity: 0.7 },
    ],
  });
  const top = [0, 1]
    .flatMap((r) => [0, 1, 2].map((c) => product(3 + c * 9.5, S2, 4 + r * 13, 7.5, 12 + ((r + c) % 3) * 2, 7, [CORAL, MINT, AMBER, VIOLET][(r + c) % 4])))
    .join("");
  return svg("cube", [shadow(0, 0, S2, S2, 8, "cube"), g("i-pop", body), g("i-rise", top)], [[0, 0, 0, S2, S2 + 18, S2]]);
}
