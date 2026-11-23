// Geometry of every isometric illustration (build/scenes.mjs), checked from the model itself:
// products stand on a support, nothing intersects, products are not hidden behind walls or shelves.
import { expect, test } from "@playwright/test";
import { HIDDEN_LIMIT, checkScenes } from "../build/scene-check.mjs";

const report = checkScenes();

test.describe("illustration geometry", () => {
  test.skip(({ isMobile }) => isMobile, "model checks run once");

  test("all twelve scenes exist", () => {
    expect(Object.keys(report).sort()).toEqual(
      ["barketa", "box", "cube", "decoration", "figure", "floor", "label", "pallet", "shelf", "table", "topper", "tray"].sort(),
    );
  });

  for (const [id, r] of Object.entries(report)) {
    test(`${id}: products stand on something and nothing intersects`, () => {
      expect(r.problems).toEqual([]);
    });
    test(`${id}: no product is hidden more than ${HIDDEN_LIMIT[id] ?? HIDDEN_LIMIT.default}%`, () => {
      for (const h of r.hidden) expect(h).toBeLessThanOrEqual(HIDDEN_LIMIT[id] ?? HIDDEN_LIMIT.default);
    });
  }
});
