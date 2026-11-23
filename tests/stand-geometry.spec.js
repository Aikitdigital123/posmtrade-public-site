// The 3D stand model itself (no browser needed): every part sits where it belongs and nothing collides.
import { expect, test } from "@playwright/test";
import { buildParts } from "../src/stand3d.js";

const parts = buildParts();
const pos = (t) => {
  const m = t.match(/translate3d\(([-\d.]+)px,([-\d.]+)px,([-\d.]+)px\)/) ?? t.match(/translate3d\(([-\d.]+)(?:px)?,([-\d.]+)(?:px)?,([-\d.]+)(?:px)?\)/);
  return m ? m.slice(1).map(Number) : [0, 0, 0];
};
const of = (cls) => parts.filter((p) => p.cls.split(" ").includes(cls));

test.describe("stand model", () => {
  test.skip(({ isMobile }) => isMobile, "model checks run once");

  test("has every part: back+rear, 2 sides, 2 edges, 4 shelves, 4 strips, 12 products, base, topper+rear", () => {
    expect(of("p-back")).toHaveLength(1);
    expect(of("p-rear")).toHaveLength(1);
    expect(of("p-side")).toHaveLength(2);
    expect(of("p-edge")).toHaveLength(2);
    expect(of("p-shelf")).toHaveLength(4);
    expect(of("p-strip")).toHaveLength(4);
    expect(of("p-box-front")).toHaveLength(12);
    expect(of("p-base")).toHaveLength(1);
    expect(of("p-topper")).toHaveLength(1);
    expect(of("p-topper-rear")).toHaveLength(1);
  });

  test("is symmetric: sides and edges mirror each other", () => {
    const [l, r] = of("p-side").map((p) => pos(p.t));
    expect(l[0]).toBe(-r[0]);
    const [el, er] = of("p-edge").map((p) => pos(p.t));
    expect(el[0]).toBe(-er[0]);
    for (const front of of("p-box-front")) expect(Math.abs(pos(front.t)[0])).toBeLessThan(85 - 19 + 0.01);
  });

  test("every product stands exactly on its shelf and is lower than the shelf above", () => {
    const shelves = of("p-shelf").map((p) => pos(p.t)[1]);
    const fronts = of("p-box-front");
    fronts.forEach((f, k) => {
      const level = Math.floor(k / 3);
      const [, cy] = pos(f.t);
      const bottom = cy + f.h / 2;
      const top = cy - f.h / 2;
      expect(bottom).toBeCloseTo(shelves[level], 5);
      const ceiling = level === 0 ? -155 : shelves[level - 1];
      expect(top).toBeGreaterThan(ceiling);
    });
  });

  test("the lowest strip ends above the base", () => {
    const strips = of("p-strip").map((p) => pos(p.t)[1] + p.h / 2);
    const base = of("p-base")[0];
    const baseTop = pos(base.t)[1] - base.h / 2;
    expect(Math.max(...strips)).toBeLessThanOrEqual(baseTop);
  });

  test("when apart, a shelf, its strip and its products move as one unit", () => {
    const shelves = of("p-shelf");
    const strips = of("p-strip");
    const boxes = parts.filter((p) => p.cls.startsWith("p-box"));
    shelves.forEach((s, i) => {
      expect(strips[i].ex).toEqual(s.ex);
      const mine = boxes.slice(i * 12, i * 12 + 12); // 3 products × 4 faces
      for (const b of mine) {
        expect(b.ex[0]).toBe(s.ex[0]);
        expect(b.ex[2]).toBe(s.ex[2]);
        expect(b.ex[1]).toBeLessThanOrEqual(s.ex[1]); // lifted, never pushed into the shelf
      }
    });
    // levels keep their order when apart (no level overtakes another)
    const apartY = shelves.map((s) => pos(s.t)[1] + s.ex[1]);
    for (let i = 1; i < apartY.length; i++) expect(apartY[i]).toBeGreaterThan(apartY[i - 1] + 40);
  });
});
