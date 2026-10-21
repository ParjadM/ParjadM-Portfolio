import sharp from "sharp";
// Supplement axe's 'incomplete' gradient checks with sampled rendered backgrounds.
// Hide only foreground text, retaining the composited surfaces and decorative layers.
export async function sampleContrast(page) {
  const labels = await page.evaluate(() => {
    const result = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const node = walker.currentNode,
        el = node.parentElement;
      if (
        !node.textContent.trim() ||
        !el ||
        el.closest('script,style,svg,[aria-hidden="true"],button:disabled')
      )
        continue;
      const style = getComputedStyle(el);
      if (style.visibility !== "visible") continue;
      let opacity = 1;
      for (let p = el; p; p = p.parentElement)
        opacity *= Number(getComputedStyle(p).opacity);
      if (opacity < 0.1) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const colors =
        style.backgroundClip === "text" && style.backgroundImage !== "none"
          ? style.backgroundImage.match(/rgba?\([^)]+\)/g) || []
          : [style.color];
      for (const r of range.getClientRects())
        if (
          r.width > 2 &&
          r.height > 2 &&
          r.x >= 0 &&
          r.right <= innerWidth + 1
        ) {
          const fractions = [0.15, 0.5, 0.85].filter((f) => {
            const x = r.x + r.width * f,
              y = r.y + r.height / 2;
            for (let p = el.parentElement; p; p = p.parentElement) {
              const ps = getComputedStyle(p),
                pr = p.getBoundingClientRect();
              if (
                /hidden|auto|scroll|clip/.test(ps.overflowY) &&
                (y < pr.top || y > pr.bottom)
              )
                return false;
              if (
                /hidden|auto|scroll|clip/.test(ps.overflowX) &&
                (x < pr.left || x > pr.right)
              )
                return false;
            }
            if (y < 0 || y >= innerHeight) return true;
            const hit = document.elementFromPoint(x, y);
            return hit && (hit === el || el.contains(hit));
          });
          if (!fractions.length) continue;
          result.push({
            fractions,
            text: node.textContent.trim().slice(0, 80),
            className: el.className,
            colors,
            opacity,
            threshold:
              parseFloat(style.fontSize) >= 24 ||
              (parseFloat(style.fontSize) >= 18.66 &&
                Number(style.fontWeight) >= 700)
                ? 3
                : 4.5,
            x: r.x + scrollX,
            y: r.y + scrollY,
            w: r.width,
            h: r.height,
          });
        }
    }
    return result;
  });
  const frozen = await page.addStyleTag({
    content: "* { transition: none !important; }",
  });
  const hidden = await page.addStyleTag({
    content:
      "* { color:transparent!important; -webkit-text-fill-color:transparent!important; text-shadow:none!important; } .bg-clip-text { background-image:none!important; }",
  });
  const png = await page.screenshot({ fullPage: true });
  await hidden.evaluate((el) => el.remove());
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await frozen.evaluate((el) => el.remove());
  const { data, info } = await sharp(png)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const lum = (rgb) =>
    rgb
      .map((c) => c / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
  const issues = [];
  for (const item of labels) {
    let minimum = Infinity;
    for (const color of item.colors) {
      const values = color.match(/[\d.]+/g)?.map(Number);
      if (!values || values.length < 3) continue;
      const alpha = (values[3] ?? 1) * item.opacity;
      if (alpha === 0) continue;
      for (const fraction of item.fractions) {
        const x = Math.floor(
            ((item.x + item.w * fraction) * info.width) /
              page.viewportSize().width,
          ),
          y = Math.floor(item.y + item.h / 2);
        if (x < 0 || x >= info.width || y < 0 || y >= info.height) continue;
        const index = (y * info.width + x) * info.channels;
        const bg = [data[index], data[index + 1], data[index + 2]],
          fg = bg.map((c, i) => values[i] * alpha + c * (1 - alpha));
        const l1 = lum(fg),
          l2 = lum(bg);
        minimum = Math.min(
          minimum,
          (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05),
        );
      }
    }
    if (minimum < item.threshold - 0.05)
      issues.push({ ...item, ratio: Math.round(minimum * 100) / 100 });
  }
  return issues;
}
