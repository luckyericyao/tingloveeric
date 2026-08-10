import { chromium } from "playwright-core";

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseURL = process.env.QA_URL || "http://127.0.0.1:3000";
const passcode = process.env.LOVE_SITE_PASSCODE || "5599";
const screenshots = "/private/tmp";

async function openPage(browser, route, viewport, protectedRoute = false) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 600, hasTouch: viewport.width < 600 });
  if (protectedRoute) {
    const unlock = await context.request.post(`${baseURL}/api/passcode`, { data: { passcode } });
    if (!unlock.ok()) throw new Error(`Could not unlock ${route}: ${unlock.status()}`);
  }
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseURL}${route}?visual=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  return { context, page, errors };
}

async function inspect(browser, route, viewport, screenshotName, protectedRoute = false) {
  const { context, page, errors } = await openPage(browser, route, viewport, protectedRoute);
  await page.screenshot({ path: `${screenshots}/${screenshotName}` });
  const result = await page.evaluate(() => {
    const visible = (selector) => [...document.querySelectorAll(selector)].filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });
    const heading = document.querySelector("h1");
    return {
      h1: heading?.textContent?.trim() || "",
      h1Size: heading ? Number.parseFloat(getComputedStyle(heading).fontSize) : null,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      roomLinks: document.querySelectorAll("a.private-room-link").length,
      visibleForms: visible("form").length,
      visibleTextareas: visible("textarea").length,
      visibleEditorPanels: visible("form[class*='editorPanel']").length,
      photoStrip: Boolean(document.querySelector(".archive-profile-gallery")),
      imageSources: [...document.querySelectorAll("img")].map((image) => image.currentSrc || image.getAttribute("src") || ""),
      bodyText: (document.body.textContent || "").replace(/\s+/g, " ").trim().slice(0, 320),
    };
  });
  await context.close();
  return { route, viewport, ...result, errors };
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--disable-gpu", "--hide-scrollbars"],
});

try {
  const results = [];
  results.push(await inspect(browser, "/", { width: 1440, height: 900 }, "ting-archive-home-desktop.png"));
  results.push(await inspect(browser, "/", { width: 390, height: 844 }, "ting-archive-home-mobile.png"));
  results.push(await inspect(browser, "/private", { width: 1440, height: 900 }, "ting-private-rooms-desktop-new.png", true));
  results.push(await inspect(browser, "/private", { width: 390, height: 844 }, "ting-private-rooms-mobile-new.png", true));
  results.push(await inspect(browser, "/her", { width: 1440, height: 900 }, "ting-her-desktop-new.png", true));
  results.push(await inspect(browser, "/her", { width: 390, height: 844 }, "ting-her-mobile-new.png", true));
  results.push(await inspect(browser, "/world", { width: 1440, height: 900 }, "ting-world-desktop-new.png", true));
  results.push(await inspect(browser, "/world", { width: 390, height: 844 }, "ting-world-mobile-new.png", true));
  results.push(await inspect(browser, "/notes", { width: 1440, height: 900 }, "ting-notes-desktop-new.png", true));
  results.push(await inspect(browser, "/notes", { width: 390, height: 844 }, "ting-notes-mobile-new.png", true));
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await browser.close();
}
