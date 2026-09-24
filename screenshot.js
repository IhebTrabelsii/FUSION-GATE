const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 900,
    },
    deviceScaleFactor: 1,
  });

  console.log("Opening FUSION...");

  await page.goto("https://fusion-gate-phi.vercel.app/", {
    waitUntil: "networkidle",
  });

  console.log("Page loaded.");

  // Give Supabase content and initial animations time to render
  await page.waitForTimeout(2000);

  // Scroll through the entire page slowly
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const distance = 400;
      const delay = 150;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);

        if (
          window.innerHeight + window.scrollY >=
          document.body.scrollHeight
        ) {
          clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  });

  // Give scroll-triggered animations time to finish
  await page.waitForTimeout(3000);

  // Go back to the top
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.waitForTimeout(1000);

  // Create screenshots folder
  if (!fs.existsSync("screenshots")) {
    fs.mkdirSync("screenshots");
  }

  console.log("Taking full-page screenshot...");

  await page.screenshot({
    path: "screenshots/fusion-full.png",
    fullPage: true,
  });

  console.log("Done!");
  console.log("Saved: screenshots/fusion-full.png");

  await browser.close();
})();