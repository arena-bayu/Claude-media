// node shot.cjs a-arsip  -> out/a-arsip-1.png, out/a-arsip-2.png, out/a-arsip-pair.png
const { chromium } = require("playwright-core");
const path = require("path");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  for (const name of process.argv.slice(2)) {
    const p = await b.newPage({ viewport: { width: 2300, height: 1450 } });
    await p.goto("file://" + path.resolve(name + ".html"));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const slides = await p.$$(".slide");
    for (const [i, s] of slides.entries()) await s.screenshot({ path: `out/${name}-${i + 1}.png` });
    await p.screenshot({ path: `out/${name}-pair.png`, fullPage: true });
    console.log(name, slides.length, "slide");
  }
  await b.close();
})();
