// Tiny isometric renderer for the product illustrations (build time only, output = inline SVG).
// A scene is a list of axis-aligned boxes (x right-back, y up, z left-front). Each box shows three faces:
// top, right (+x) and front (+z), shaded from one light, so every drawing looks like the 3D stand.
// "Decals" are prints on a face (strips, logos, labels) given in the face's own coordinates.
// Boxes are drawn in the order given (back to front) – scenes list them that way.

const C = Math.cos(Math.PI / 6);
const S = 0.5;

export function project([x, y, z]) {
  return [(x - z) * C, (x + z) * S - y];
}

function hexToRgb(h) {
  const n = Number.parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function shade(hex, f) {
  const [r, g, b] = hexToRgb(hex);
  const m = (v) => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f));
  return `#${[m(r), m(g), m(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const pts = (list) =>
  list
    .map(project)
    .map(([a, b]) => `${a.toFixed(2)},${b.toFixed(2)}`)
    .join(" ");

// Face frames: origin + two axes, so a decal at (u, v) lands on the right spot of that face.
function frame(b, face) {
  const { x, y, z, w, h, d } = b;
  if (face === "front") return { o: [x, y, z + d], u: [1, 0, 0], v: [0, 1, 0] }; // u → x, v ↑ y
  if (face === "right") return { o: [x + w, y, z + d], u: [0, 0, -1], v: [0, 1, 0] }; // u → back (−z)
  return { o: [x, y + h, z + d], u: [1, 0, 0], v: [0, 0, -1] }; // top: u → x, v → back
}

const onFace = (f, u, v) => [f.o[0] + f.u[0] * u + f.v[0] * v, f.o[1] + f.u[1] * u + f.v[1] * v, f.o[2] + f.u[2] * u + f.v[2] * v];

// Every box of the scene being drawn is recorded (with its role), so tests can check the geometry:
// products stand on something, nothing intersects, products are not hidden behind panels.
// svg() files the recorded boxes under the scene id in `sceneParts` and starts a new list.
let recorded = [];
let nextUid = 1;
export const sceneParts = {};

// Box with optional decals: { face, rect:[u0,v0,u1,v1], color } or { face, path:[[u,v]...], color }
// or { face, circle:[u,v,r], color }.
export function box(x, y, z, w, h, d, color, opts = {}) {
  const b = { x, y, z, w, h, d };
  const uid = nextUid++;
  recorded.push({ ...b, role: opts.role ?? "part", name: opts.name ?? "", uid });
  const top = opts.top ?? shade(color, 0.28);
  const right = opts.right ?? shade(color, -0.22);
  const front = opts.front ?? color;
  const edge = opts.edge ?? "rgba(11,37,64,.18)";
  let out = `<g data-b="${uid}">`;
  if (!opts.noRight)
    out += `<polygon points="${pts([[x + w, y, z + d], [x + w, y, z], [x + w, y + h, z], [x + w, y + h, z + d]])}" fill="${right}"/>`;
  if (!opts.noFront)
    out += `<polygon points="${pts([[x, y, z + d], [x + w, y, z + d], [x + w, y + h, z + d], [x, y + h, z + d]])}" fill="${front}"/>`;
  if (!opts.noTop)
    out += `<polygon points="${pts([[x, y + h, z + d], [x + w, y + h, z + d], [x + w, y + h, z], [x, y + h, z]])}" fill="${top}"/>`;
  for (const dcl of opts.decals ?? []) {
    const f = frame(b, dcl.face);
    let poly;
    if (dcl.rect) {
      const [u0, v0, u1, v1] = dcl.rect;
      poly = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
    } else if (dcl.circle) {
      const [cu, cv, r] = dcl.circle;
      poly = Array.from({ length: 24 }, (_, i) => [cu + r * Math.cos((i / 24) * Math.PI * 2), cv + r * Math.sin((i / 24) * Math.PI * 2)]);
    } else poly = dcl.path;
    out += `<polygon points="${pts(poly.map(([u, v]) => onFace(f, u, v)))}" fill="${dcl.color}"${dcl.opacity ? ` opacity="${dcl.opacity}"` : ""}/>`;
  }
  if (opts.outline !== false) {
    // a fine edge on the visible silhouette makes the cardboard read crisply at small sizes
    out += `<polyline points="${pts([[x, y + h, z + d], [x + w, y + h, z + d], [x + w, y + h, z], [x + w, y, z], [x + w, y, z + d], [x, y, z + d], [x, y + h, z + d]])}" fill="none" stroke="${edge}" stroke-width=".6" stroke-linejoin="round"/>`;
  }
  return `${out}</g>`;
}

// Soft floor shadow under a footprint.
export function shadow(x, z, w, d, grow = 6, id = "ID") {
  const c = project([x + w / 2, 0, z + d / 2]);
  const rx = ((w + d) * C) / 2 + grow;
  const ry = ((w + d) * S) / 2 + grow / 2;
  return `<ellipse cx="${c[0].toFixed(1)}" cy="${(c[1] + 2).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#iso-shadow-ID)"/>`;
}

// Wrap groups into an <svg> whose viewBox fits every point used.
export function svg(id, groups, bounds) {
  // the draw order is the order in which the boxes appear in the final drawing
  const body = groups.join("\n  ");
  const drawn = [...body.matchAll(/data-b="(\d+)"/g)].map((m) => Number(m[1]));
  sceneParts[id] = recorded
    .map((b) => ({ ...b, order: drawn.indexOf(b.uid) }))
    .filter((b) => b.order >= 0)
    .sort((a, b) => a.order - b.order);
  recorded = [];
  const corners = [];
  for (const [x0, y0, z0, x1, y1, z1] of bounds)
    for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) corners.push(project([x, y, z]));
  const xs = corners.map((p) => p[0]);
  const ys = corners.map((p) => p[1]);
  const pad = 6;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - minX + pad;
  const h = Math.max(...ys) - minY + pad;
  // tight viewBox: the drawing keeps its own proportions and CSS fits it into the frame
  return `<svg viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}" aria-hidden="true" data-iso="${id}">
  <defs><radialGradient id="iso-shadow-${id}"><stop offset="0" stop-color="#0b2540" stop-opacity=".28"/><stop offset="1" stop-color="#0b2540" stop-opacity="0"/></radialGradient></defs>
  ${groups.join("\n  ").replaceAll("#iso-shadow-ID", `#iso-shadow-${id}`)}
</svg>`;
}
