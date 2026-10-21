import { chromium } from "playwright";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import { THEMES, getEstCalendarDayNumber } from "../src/utils/themeConfig.js";
import { sampleContrast } from "./sample-rendered-contrast.mjs";
const require = createRequire(import.meta.url);
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
  headless: true,
});
await fs.mkdir("tmp/contrast", { recursive: true });
const results = [];
for (const width of [1440, 390])
  for (const theme of Object.keys(THEMES)) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: process.env.AUDIT_MOTION || "reduce",
    });
    await page.addInitScript(
      ({ theme, day }) => {
        localStorage.setItem("portfolio_theme_id", theme);
        localStorage.setItem("portfolio_theme_manual", "1");
        localStorage.setItem("portfolio_theme_manual_est_day", day);
        localStorage.setItem("portfolio_cursor_theme_id", "native");
      },
      { theme, day: String(getEstCalendarDayNumber()) },
    );
    for (const state of (
      process.env.AUDIT_STATES || "palette,navigation,chat,hover,editor,focus"
    ).split(",")) {
      await page.goto(
        (process.env.AUDIT_URL || "http://127.0.0.1:5180") +
          (state === "editor"
            ? "/algorithm-memorizer"
            : state === "focus"
              ? "/contact"
              : "/"),
      );
      await page.waitForTimeout(500);
      await page.evaluate(() => document.fonts.ready);
      if (state === "editor")
        await page
          .locator(".cm-content")
          .fill(
            'def square(value):\n    # A readable comment\n    label = \"Hello\"\n    return value * 42',
          );
      if (state === "focus") {
        await page.locator("main input").first().focus();
        await page.keyboard.press("Tab");
        const focus = await page.evaluate(() => {
          const el = document.activeElement,
            style = getComputedStyle(el);
          return {
            visible: el.matches(":focus-visible"),
            width: parseFloat(style.outlineWidth),
          };
        });
        if (!focus.visible || focus.width < 2)
          throw new Error("Missing keyboard focus indicator");
      }
      if (state === "palette")
        await page
          .locator('button[aria-label="Theme palette"]:visible')
          .click();
      if (state === "navigation")
        await page
          .getByRole("button", {
            name: width < 1024 ? "Open menu" : "More pages",
            exact: true,
          })
          .click();
      if (state === "chat")
        await page
          .getByRole("button", { name: "Open chat", exact: true })
          .click();
      if (state === "hover")
        await page.locator("main .theme-action").first().hover();
      await page.waitForTimeout(600);
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const sampled = await sampleContrast(page);
      const axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: { type: "rule", values: ["color-contrast"] },
        });
        return r.violations.flatMap((v) =>
          v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        );
      });
      results.push({ width, theme, state, sampled, axe });
      console.log(
        width,
        theme,
        state,
        "sampled",
        sampled.length,
        "axe",
        axe.length,
      );
      if (state === "hover")
        await page.screenshot({
          path: `tmp/contrast/${theme}-${width}.png`,
          fullPage: true,
        });
    }
    await page.close();
  }
await fs.writeFile(
  "tmp/contrast/" + (process.env.AUDIT_LABEL || "interactions") + ".json",
  JSON.stringify(results, null, 2),
);
await browser.close();
if (results.some((r) => r.sampled.length || r.axe.length)) process.exitCode = 1;
