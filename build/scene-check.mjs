// Geometry check of the isometric illustrations (used by tests/illustrations.spec.js and runnable by hand:
// `node build/scene-check.mjs`). For every scene: products stand on a support, nothing intersects,
// and how much of each product is hidden behind the parts drawn in front of it.
import { project, sceneParts } from "./iso.mjs";
import { icons } from "./icons.mjs";

const EPS = 0.01;

// How much of a product may be hidden by parts in front of it (%). A printed lip, skirt or frame in front
// of products is intended and may hide more; walls and shelves must not swallow them.
export const HIDDEN_LIMIT = { default: 20, table: 40, tray: 40, barketa: 45, pallet: 50 };

function hull(b) {
  const pts = [];
  for (const x of [b.x, b.x + b.w]) for (const y of [b.y, b.y + b.h]) for (const z of [b.z, b.z + b.d]) pts.push(project([x, y, z]));
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o, a, c) => (a[0] - o[0]) * (c[1] - o[1]) - (a[1] - o[1]) * (c[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

const area = (poly) => Math.abs(poly.reduce((s, p, i) => s + p[0] * poly[(i + 1) % poly.length][1] - poly[(i + 1) % poly.length][0] * p[1], 0)) / 2;

// Sutherland–Hodgman: part of `subject` inside convex `clip` (both counter-clockwise or both clockwise).
function clipPoly(subject, clip) {
  let out = subject;
  const sign = Math.sign(clip.reduce((s, p, i) => s + p[0] * clip[(i + 1) % clip.length][1] - clip[(i + 1) % clip.length][0] * p[1], 0));
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i];
    const b = clip[(i + 1) % clip.length];
    const inside = (p) => sign * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) >= 0;
    const cut = (p, q) => {
      const a1 = b[1] - a[1];
      const b1 = a[0] - b[0];
      const c1 = a1 * a[0] + b1 * a[1];
      const a2 = q[1] - p[1];
      const b2 = p[0] - q[0];
      const c2 = a2 * p[0] + b2 * p[1];
      const det = a1 * b2 - a2 * b1;
      return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det];
    };
    const input = out;
    out = [];
    for (let k = 0; k < input.length; k++) {
      const p = input[k];
      const q = input[(k + 1) % input.length];
      if (inside(q)) {
        if (!inside(p)) out.push(cut(p, q));
        out.push(q);
      } else if (inside(p)) out.push(cut(p, q));
    }
  }
  return out;
}

const overlap1 = (a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0);

export function checkScenes() {
  void icons; // building the icons fills sceneParts
  const report = {};
  for (const [id, parts] of Object.entries(sceneParts)) {
    const problems = [];
    const products = parts.filter((p) => p.role === "product");
    // 1. support: a product's bottom lies on the top of a box under its whole footprint
    for (const p of products) {
      const support = parts.find(
        (s) =>
          s !== p &&
          Math.abs(s.y + s.h - p.y) < EPS &&
          s.x - EPS <= p.x && p.x + p.w <= s.x + s.w + EPS &&
          s.z - EPS <= p.z && p.z + p.d <= s.z + s.d + EPS,
      );
      if (!support) problems.push(`product #${p.order} at (${p.x},${p.y},${p.z}) does not stand on anything`);
    }
    // 2. nothing intersects
    for (let i = 0; i < parts.length; i++)
      for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i];
        const b = parts[j];
        const ox = overlap1(a.x, a.x + a.w, b.x, b.x + b.w);
        const oy = overlap1(a.y, a.y + a.h, b.y, b.y + b.h);
        const oz = overlap1(a.z, a.z + a.d, b.z, b.z + b.d);
        const inSkirt = (a.role === "skirt") !== (b.role === "skirt");
        if (ox > EPS && oy > EPS && oz > EPS && !inSkirt) problems.push(`#${a.order} (${a.role}) intersects #${b.order} (${b.role})`);
      }
    // 3. visibility: share of each product hidden by non-product parts drawn after it
    const hidden = products.map((p) => {
      const hp = hull(p);
      const total = area(hp);
      let covered = 0;
      for (const q of parts) {
        if (q.order <= p.order || q.role === "product") continue;
        if (q.role === "skirt") {
          // open box: only the front and right walls hide what is inside
          const front = [[q.x, q.y, q.z + q.d], [q.x + q.w, q.y, q.z + q.d], [q.x + q.w, q.y + q.h, q.z + q.d], [q.x, q.y + q.h, q.z + q.d]].map(project);
          const right = [[q.x + q.w, q.y, q.z + q.d], [q.x + q.w, q.y, q.z], [q.x + q.w, q.y + q.h, q.z], [q.x + q.w, q.y + q.h, q.z + q.d]].map(project);
          covered += area(clipPoly(hp, front)) + area(clipPoly(hp, right));
        } else covered += area(clipPoly(hp, hull(q)));
      }
      return Math.min(1, covered / total);
    });
    report[id] = { products: products.length, parts: parts.length, problems, hidden: hidden.map((h) => Math.round(h * 100)) };
  }
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(checkScenes(), null, 1));
