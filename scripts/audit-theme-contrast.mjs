import { sampleContrast } from "./sample-rendered-contrast.mjs";
import { chromium } from "playwright";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import { THEMES, getEstCalendarDayNumber } from "../src/utils/themeConfig.js";
const require = createRequire(import.meta.url);
const base = process.env.AUDIT_URL || "http://127.0.0.1:5180";
const label = process.env.AUDIT_LABEL || "current";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
  headless: true,
});
await fs.mkdir("tmp/contrast", { recursive: true });
const results = [];
for (const theme of Object.keys(THEMES)) {
  const page = await browser.newPage({
    viewport: { width: Number(process.env.AUDIT_WIDTH || 1440), height: 1000 },
    reducedMotion: "reduce",
  });
  if (process.env.AUDIT_FIXTURES === "1") {
    const post = {
      id: "contrast-fixture",
      title: "Contrast test article",
      category: "technology",
      excerpt: "Test fixture for article text and metadata.",
      content:
        "## A heading\n\nA paragraph with **emphasis** and [a link](https://example.com).\n\n\x60\x60\x60python\nprint(1)\n\x60\x60\x60",
      tags: ["Testing"],
      date: "2026-10-01",
      readTime: "2 min",
    };
    await page.route(/\/api\/projects(?:[/?].*)?$/, (r) =>
      r.fulfill({
        json: {
          projects: [
            {
              id: "contrast-fixture",
              title: "Contrast test project",
              description:
                "Test fixture for project descriptions, technology labels and source links.",
              tags: ["React", "Python"],
              liveUrl: "/projects/qaLab",
              githubUrl: "https://github.com/ParjadM",
              image: "/src/Images/CodeQuest.webp",
              featured: true,
            },
          ],
          pagination: { totalItems: 1 },
        },
      }),
    );
    await page.route(/\/api\/blog(?:[/?].*)?$/, (r) =>
      r.fulfill({
        json:
          r.request().url().includes("/contrast-fixture") &&
          !r.request().url().includes("/related")
            ? { post }
            : { posts: [post], pagination: { totalItems: 1 } },
      }),
    );
  }
  await page.addInitScript(
    ({ theme, day }) => {
      localStorage.setItem("portfolio_theme_id", theme);
      localStorage.setItem("portfolio_theme_manual", "1");
      localStorage.setItem("portfolio_theme_manual_est_day", day);
      localStorage.setItem("portfolio_cursor_theme_id", "native");
    },
    { theme, day: String(getEstCalendarDayNumber()) },
  );
  for (const route of (
    process.env.AUDIT_ROUTES ||
    "/,/projects,/about,/contact,/blog,/explore,/projects/qaLab,/projects/lqftBenchmark,/projects/cameraFx,/algorithm-memorizer,/stats,/interview,/admin/login"
  ).split(",")) {
    await page.goto(base + route);
    await page.waitForTimeout(500);
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    await page.locator("#main-content").waitFor();
    if (
      (await page.locator(".site-shell").getAttribute("data-theme")) !== theme
    )
      throw new Error("Theme did not apply: " + theme);
    const sampled = await sampleContrast(page);
    const issues = await page.evaluate(async () => {
      const r = await window.axe.run(document, {
        runOnly: { type: "rule", values: ["color-contrast"] },
      });
      return {
        violations: r.violations.flatMap((v) =>
          v.nodes.map((n) => ({
            target: n.target,
            html: n.html,
            summary: n.failureSummary,
          })),
        ),
        incomplete: r.incomplete.flatMap((v) =>
          v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        ),
      };
    });
    results.push({ theme, route, sampled, ...issues });
    console.log(
      theme,
      route,
      "axe",
      issues.violations.length,
      "sampled",
      sampled.length,
    );
  }
  await page.close();
}
await fs.writeFile(
  `tmp/contrast/${label}.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
if (results.some((r) => r.violations.length || r.sampled.length))
  process.exitCode = 1;
