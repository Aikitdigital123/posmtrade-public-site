// Regressions found by the independent review (2026-11-23). Each test pins one finding.
import { expect, test } from "@playwright/test";

const contrast = (a, b) => {
  const lum = (rgb) => {
    const c = rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const rgb = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

test("the header stays on top while scrolling", async ({ page }) => {
  await page.goto("");
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(300);
  const top = await page.locator(".site-header").evaluate((h) => h.getBoundingClientRect().top);
  expect(Math.abs(top)).toBeLessThan(2);
  await expect(page.locator(".site-header")).toHaveClass(/is-scrolled/);
});

test("phone: an open menu locks the page and keeps its close button", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("");
  await page.locator(".menu-toggle").click();
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => window.scrollY);
  // a real gesture (wheel / finger), not a programmatic scroll – the page must not move under the menu
  await page.mouse.move(200, 600);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await expect(page.locator(".menu-toggle")).toBeInViewport();
});

for (const p of ["privacy.html", "cs/terms.html"]) {
  test(`phone: the menu works on ${p}`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone only");
    await page.goto(p);
    await page.locator(".menu-toggle").click();
    await page.waitForTimeout(600);
    await expect(page.locator(".main-nav")).toBeVisible();
    await expect(page.locator(".main-nav a").first()).toBeInViewport();
    await page.locator(".main-nav a[href='index.html#contact']").click();
    await expect(page).toHaveURL(/index\.html#contact$/);
  });
}

test("phone: the stand never slides under the numbers", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("");
  for (const y of [0, 300, 600, 900]) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(150);
    const btn = await page.locator(".stand-toggle").boundingBox();
    const stats = await page.locator(".stats").boundingBox();
    expect(btn.y + btn.height).toBeLessThanOrEqual(stats.y + 1);
  }
});

test.describe("laptop 1280×720", () => {
  test.use({ viewport: { width: 1280, height: 720 } });
  test("hero buttons and the stand's button are on screen", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("");
    await page.waitForTimeout(800);
    for (const sel of [".hero-links .button >> nth=0", ".hero-links .button >> nth=1", ".stand-toggle"]) {
      const b = await page.locator(sel).boundingBox();
      expect(b.y + b.height).toBeLessThanOrEqual(720);
    }
  });
});

test("phone: the active project tab is always visible in its row", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("");
  await page.locator("#projects").scrollIntoViewIfNeeded();
  const row = page.locator(".proj-tabs");
  for (const k of ["decoration", "tray", "cube", "display"]) {
    await page.evaluate((k) => document.querySelector(`#pt-${k}`).click(), k);
    await page.waitForTimeout(700);
    const [r, t] = await Promise.all([row.boundingBox(), page.locator(`#pt-${k}`).boundingBox()]);
    expect(t.x).toBeGreaterThanOrEqual(r.x - 1);
    expect(t.x + t.width).toBeLessThanOrEqual(r.x + r.width + 1);
  }
});

for (const vp of [{ width: 820, height: 1180 }, { width: 390, height: 844 }]) {
  test.describe(`die-line at ${vp.width}px`, () => {
    test.use({ viewport: vp });
    test("the drawing fits its frame, no big empty area", async ({ page }) => {
      await page.goto("");
      await page.locator("#mockup").scrollIntoViewIfNeeded();
      const [stage, art] = await Promise.all([page.locator(".mockup-stage").boundingBox(), page.locator(".dieline-svg").boundingBox()]);
      expect(art.y + art.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
      expect(stage.height - art.height).toBeLessThan(80);
    });
  });
}

test("headings: a one-letter word never ends a line (it is glued to the next word)", async ({ page }) => {
  for (const dir of ["", "cs/", "en/"]) {
    await page.goto(dir);
    const texts = await page.locator("h1, h2, h3, p").allTextContents();
    for (const t of texts) expect(t, t).not.toMatch(/(^|\s)[взіїйуаоvszkouaiVSZKOUAI] /u);
  }
});

test("small blue texts, buttons and the contact banner meet WCAG AA contrast", async ({ page }) => {
  await page.goto("");
  const eyebrow = await page.locator("#services .eyebrow").evaluate((e) => getComputedStyle(e).color);
  expect(contrast(rgb(eyebrow), [244, 251, 255])).toBeGreaterThanOrEqual(4.5);
  // white text on the start (lightest) colour of the button and banner gradients
  for (const sel of [".hero-links .button >> nth=0", ".contact-card"]) {
    const bg = await page.locator(sel).evaluate((e) => getComputedStyle(e).backgroundImage);
    const first = rgb(bg.slice(bg.indexOf("rgb")));
    expect(contrast([255, 255, 255], first), `${sel} ${bg}`).toBeGreaterThanOrEqual(4.5);
  }
});

test("agent names are readable in Czech and English (Latin letters)", async ({ page }) => {
  for (const dir of ["cs/", "en/"]) {
    await page.goto(dir);
    const names = await page.locator(".agent-card h3").allTextContents();
    expect(names).toHaveLength(10);
    for (const n of names) expect(n).toMatch(/^[\p{Script=Latin}\s]+$/u);
  }
});

test("legal pages have their own description and every page names its language versions", async ({ page }) => {
  await page.goto("privacy.html");
  const home = await page.request.get("").then((r) => r.text());
  const desc = await page.locator("meta[name=description]").getAttribute("content");
  expect(home).not.toContain(`content="${desc}"`);
  await expect(page.locator("link[rel=alternate][hreflang]")).toHaveCount(4);
  await expect(page.locator("link[rel=canonical]")).toHaveCount(1);
});

test("contacts: each icon sits on the same line as its phone number or e-mail", async ({ page }) => {
  await page.goto("");
  for (const line of await page.locator(".person-line svg").all()) {
    const [icon, text] = await Promise.all([line.boundingBox(), line.locator("xpath=..").boundingBox()]);
    expect(icon.height).toBeGreaterThan(text.height * 0.5); // icon and text share one line
  }
});
