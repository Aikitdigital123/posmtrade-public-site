// End-to-end checks of the built site, on desktop and on a phone (see playwright.config.js).
import { expect, test } from "@playwright/test";

const LANGS = [
  { dir: "", lang: "uk", menu: "Проєкти", copied: "Скопійовано" },
  { dir: "cs/", lang: "cs", menu: "Projekty", copied: "Zkopírováno" },
  { dir: "en/", lang: "en", menu: "Projects", copied: "Copied" },
];
const PAGES = ["index.html", "privacy.html", "terms.html"];
const SECTIONS = ["services", "projects", "process", "mockup", "agents", "contact"];

// Collects page errors and console errors during a test.
function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test.describe("public URLs (Google OAuth + e-mail footer)", () => {
  for (const dir of ["", "uk/", "cs/", "en/"]) {
    for (const page of PAGES) {
      test(`${dir}${page} loads without errors`, async ({ page: p }) => {
        const errors = watchErrors(p);
        const res = await p.goto(`${dir}${page}`);
        expect(res.status()).toBe(200);
        await expect(p.locator("h1")).toHaveCount(1);
        await expect(p.locator("footer a[href='privacy.html']")).toBeVisible();
        await p.waitForTimeout(300);
        expect(errors).toEqual([]);
      });
    }
  }
});

for (const L of LANGS) {
  test.describe(`home page ${L.lang}`, () => {
    test("right language, title and every section present", async ({ page }) => {
      await page.goto(L.dir);
      await expect(page.locator("html")).toHaveAttribute("lang", L.lang);
      await expect(page).toHaveTitle(/POSMTRADE/);
      for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toHaveCount(1);
    });

    test("no horizontal scrolling", async ({ page }) => {
      await page.goto(L.dir);
      for (const y of [0, 1500, 3000, 6000, 99999]) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        const [sw, w] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        expect(sw).toBeLessThanOrEqual(w);
      }
    });

    test("menu links lead to existing sections", async ({ page }) => {
      await page.goto(L.dir);
      const hrefs = await page.locator(".main-nav a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      expect(hrefs.map((h) => h.slice(1))).toEqual(SECTIONS);
      await expect(page.locator(".main-nav")).toContainText(L.menu);
    });

    test("language switch points to the same page in each language", async ({ page }) => {
      await page.goto(L.dir);
      const links = page.locator(".language-switch a");
      await expect(links).toHaveCount(3);
      await expect(page.locator(`.language-switch a[lang="${L.lang}"]`)).toHaveAttribute("aria-current", "page");
    });
  });
}

test.describe("header", () => {
  test("logo always; the POSMTRADE text next to it on desktop, hidden on a phone", async ({ page, isMobile }) => {
    await page.goto("");
    await page.waitForTimeout(1500);
    await expect(page.locator(".brand img")).toBeVisible();
    if (isMobile) await expect(page.locator(".brand span")).toBeHidden();
    else await expect(page.locator(".brand span")).toBeVisible();
  });
});

test.describe("menu", () => {
  test("desktop: pill follows the hovered item", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("");
    const item = page.locator(".main-nav a").nth(2);
    await item.hover();
    await page.waitForTimeout(600);
    const [pill, link] = await Promise.all([
      page.locator(".nav-pill").boundingBox(),
      item.boundingBox(),
    ]);
    expect(Math.abs(pill.x - link.x)).toBeLessThan(2);
    expect(Math.abs(pill.width - link.width)).toBeLessThan(2);
  });

  test("mobile: full-screen menu opens, scrolls to a section and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("");
    for (const y of [0, 2500]) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.locator(".menu-toggle").click();
      await page.waitForTimeout(700);
      const box = await page.locator(".main-nav").boundingBox();
      const vw = page.viewportSize();
      expect(box.width).toBeGreaterThanOrEqual(vw.width - 1);
      expect(box.height).toBeGreaterThanOrEqual(vw.height - 1);
      await page.locator(".main-nav a[href='#contact']").click();
      await expect(page.locator(".main-nav")).not.toHaveClass(/is-open/);
      // smooth scrolling over a long page takes a moment
      await expect
        .poll(() => page.locator("#contact").evaluate((el) => Math.abs(el.getBoundingClientRect().top)), { timeout: 5000 })
        .toBeLessThan(120);
    }
    await page.locator(".menu-toggle").click();
    await page.keyboard.press("Escape");
    await expect(page.locator(".main-nav")).not.toHaveClass(/is-open/);
  });
});

test.describe("3D stand", () => {
  test("assembles, comes apart and back together with the button", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("");
    const stage = page.locator("[data-stand3d]");
    await expect.poll(() => stage.evaluate((s) => s.standState().introDone), { timeout: 8000 }).toBe(true);
    const btn = stage.locator(".stand-toggle");
    await btn.click();
    await expect.poll(() => stage.evaluate((s) => s.standState().apart)).toBeGreaterThan(0.95);
    await expect(btn).toHaveAttribute("aria-pressed", "true");
    await btn.click();
    await expect.poll(() => stage.evaluate((s) => s.standState().apart)).toBeLessThan(0.05);
    await expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(errors).toEqual([]);
  });

  for (const angle of [0, -40, -90, 180]) {
    test(`apart at ${angle}° every part stays in the frame`, async ({ page }) => {
      await page.goto("");
      const stage = page.locator("[data-stand3d]");
      await expect.poll(() => stage.evaluate((s) => s.standState().introDone), { timeout: 8000 }).toBe(true);
      await stage.evaluate((s, a) => s.stand.pose(a, -12, 1), angle);
      await page.waitForTimeout(100);
      const frame = await stage.boundingBox();
      const boxes = await stage.locator(".stand3d > div").evaluateAll((els) =>
        els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0).map((r) => ({ x: r.x, y: r.y, r: r.right, b: r.bottom })),
      );
      const page_w = page.viewportSize().width;
      for (const b of boxes) {
        expect(b.y).toBeGreaterThan(frame.y - 60); // a little above the frame is fine (no clipping there)
        expect(b.b).toBeLessThan(frame.y + frame.height + 10);
        expect(b.x).toBeGreaterThan(-1);
        expect(b.r).toBeLessThan(page_w + 1);
      }
    });
  }
});

test.describe("projects", () => {
  test("every tab shows its own panel; arrows move between tabs", async ({ page }) => {
    await page.goto("");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    const tabs = page.locator(".proj-tab");
    const n = await tabs.count();
    expect(n).toBe(8);
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
      await expect(page.locator(".proj-panel.is-active")).toHaveCount(1);
      const id = await tabs.nth(i).getAttribute("aria-controls");
      await expect(page.locator(`#${id}`)).toHaveClass(/is-active/);
    }
    await tabs.nth(0).click();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("year chart has 2021–2026", async ({ page }) => {
    await page.goto("");
    await expect(page.locator(".year-label")).toHaveText([/^2021/, /^2022/, /^2023/, /^2024/, /^2025/, /^2026/]);
  });
});

test.describe("contacts", () => {
  test("Maryna and Volodymyr: call and write links", async ({ page }) => {
    await page.goto("");
    const people = page.locator(".person");
    await expect(people).toHaveCount(2);
    await expect(people.nth(0)).toContainText("Марина Гиндрюк");
    await expect(people.nth(0).locator("a[href='tel:+380674300121']").first()).toBeVisible();
    await expect(people.nth(0).locator("a[href='mailto:m.gindryuk@branaldi-sv.com']").first()).toBeVisible();
    await expect(people.nth(1)).toContainText("Володимир Гергель");
    await expect(people.nth(1).locator("a[href='tel:+380674324035']").first()).toBeVisible();
    await expect(people.nth(1).locator("a[href='mailto:v.gergel@branaldi-sv.com']").first()).toBeVisible();
    await expect(page.locator(".office a[href='tel:+380432551038']")).toBeVisible();
  });

  test("copy button copies the e-mail", async ({ page, context, isMobile }) => {
    test.skip(isMobile, "clipboard permission is a desktop feature");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("");
    const btn = page.locator(".person .copy").first();
    await btn.click();
    await expect(btn).toHaveText("Скопійовано");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("m.gindryuk@branaldi-sv.com");
  });
});

test.describe("illustrations", () => {
  test("services: six detailed 3D drawings, each fully inside its card", async ({ page }) => {
    await page.goto("");
    await page.locator("#services").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const cards = page.locator(".service-card");
    await expect(cards).toHaveCount(6);
    for (const card of await cards.all()) {
      const stage = await card.locator(".service-icon").boundingBox();
      const art = await card.locator(".service-icon svg").boundingBox();
      expect(await card.locator(".service-icon svg").getAttribute("data-iso")).toBeTruthy();
      expect(art.y).toBeGreaterThanOrEqual(stage.y - 1);
      expect(art.y + art.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
      expect(art.x).toBeGreaterThanOrEqual(stage.x - 1);
      expect(art.x + art.width).toBeLessThanOrEqual(stage.x + stage.width + 1);
    }
  });

  test("projects: every type has its own 3D drawing", async ({ page }) => {
    await page.goto("");
    const ids = await page.locator(".proj-panel svg").evaluateAll((s) => s.map((e) => e.getAttribute("data-iso")));
    expect(ids).toEqual(["floor", "barketa", "figure", "box", "decoration", "pallet", "tray", "cube"]);
  });
});

test.describe("content rules", () => {
  test("agents are drawn icons, never photos", async ({ page }) => {
    await page.goto("");
    await expect(page.locator(".agent-card")).toHaveCount(10);
    await expect(page.locator(".agent-card img")).toHaveCount(0);
    await expect(page.locator(".agent-card svg")).toHaveCount(10);
  });

  test("every image has alt text and every button a name", async ({ page }) => {
    await page.goto("");
    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt).toBe(0);
    for (const b of await page.locator("button").all()) expect((await b.textContent()).trim() || (await b.getAttribute("aria-label"))).toBeTruthy();
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("all content is visible without animations", async ({ page }) => {
    await page.goto("");
    await page.waitForTimeout(300);
    for (const el of await page.locator(".reveal").all()) {
      expect(Number(await el.evaluate((e) => getComputedStyle(e).opacity))).toBe(1);
    }
    expect(Number(await page.locator("h1 .w > span").first().evaluate((e) => getComputedStyle(e).opacity))).toBe(1);
  });
});
