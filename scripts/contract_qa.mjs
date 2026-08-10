import { chromium } from "playwright-core";

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseURL = process.env.QA_URL || "http://127.0.0.1:3000";
const protectedRoutes = new Set(["/private", "/her", "/him", "/world", "/notes", "/story", "/board", "/achievements"]);
const failures = [];
const checks = [];

function record(name, passed, detail = "") {
  checks.push({ name, passed, detail });
  if (!passed) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

async function inspectRoute(browser, route, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  if (protectedRoutes.has(route)) {
    const unlockResponse = await context.request.post(`${baseURL}/api/passcode`, {
      data: { passcode: process.env.LOVE_SITE_PASSCODE || "5599" },
    });
    record(`${route} test access unlocked`, unlockResponse.ok(), String(unlockResponse.status()));
  }
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(`${baseURL}${route}?contract=1`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);
  const result = await page.evaluate(() => {
    const controls = [...document.querySelectorAll("button")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      })
      .map((button) => ({
        label: button.getAttribute("aria-label") || button.textContent?.trim() || "button",
        width: Math.round(button.getBoundingClientRect().width),
        height: Math.round(button.getBoundingClientRect().height),
      }));
    return {
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      controls,
      text: document.body.textContent || "",
    };
  });
  record(`${route} returns 200`, response?.status() === 200, String(response?.status()));
  record(`${route} has no horizontal overflow at ${viewport.width}px`, result.overflowX <= 1, String(result.overflowX));
  const undersized = result.controls.filter((control) => control.width < 44 || control.height < 44);
  record(`${route} visible buttons are at least 44px`, undersized.length === 0, JSON.stringify(undersized));
  record(`${route} has no retired romantic copy`, !/(她写给我|和好以后更喜欢你|今天也喜欢你|破镜重圆|共同决定|想一起|一起去|我俩|她会回来|她一定会)/.test(result.text));
  record(`${route} has no browser errors`, errors.length === 0, JSON.stringify(errors));
  if (route === "/private") {
    const privateRoomCount = await page.locator("a.private-room-link").count();
    record("private archive exposes exactly four quiet rooms", privateRoomCount === 4, String(privateRoomCount));
  }
  await context.close();
}

async function inspectCinema(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseURL}/cinema?contract=1`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "进入故事" }).click();
  await page.locator("article h2").waitFor({ state: "visible", timeout: 20000 });
  const sourceVisible = await page.locator("[class*='chapterMeta']").textContent();
  record("cinema chapter exposes source label", Boolean(sourceVisible && /档案说明|真实记录|Eric 的感受|愿望/.test(sourceVisible)), sourceVisible || "missing");

  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => document.querySelector("main")?.getAttribute("data-chapter") === "1", null, { timeout: 3000 });
  await page.locator("main[data-playback='settled']").waitFor({ timeout: 16000 });
  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction(() => document.querySelector("main")?.getAttribute("data-chapter") === "0", null, { timeout: 3000 });
  const returnState = await page.locator("main").evaluate((main) => ({
    chapter: main.getAttribute("data-chapter"),
    maxViewed: main.getAttribute("data-max-viewed"),
  }));
  record("cinema keyboard advances one chapter", returnState.maxViewed === "1", JSON.stringify(returnState));
  record("cinema keyboard returns one chapter", returnState.chapter === "0", JSON.stringify(returnState));
  await context.close();
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader", "--hide-scrollbars"],
});

try {
  for (const route of ["/", "/private", "/her", "/him", "/world", "/notes", "/story", "/coordinates"]) {
    await inspectRoute(browser, route, { width: 1440, height: 900 });
  }

  for (const route of ["/", "/private", "/her", "/him", "/world", "/notes", "/story"]) {
    await inspectRoute(browser, route, { width: 720, height: 900 });
  }

  await inspectCinema(browser);

  const homeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const home = await homeContext.newPage();
  await home.goto(`${baseURL}/?contract=home`, { waitUntil: "domcontentloaded" });
  await home.waitForTimeout(300);
  const homeContract = await home.evaluate(() => ({
    sourceCaptions: [...document.querySelectorAll("[aria-label='原始坐标时间线'] figure figcaption")].map((node) => node.textContent?.trim()),
    privateRoomLinks: [...document.querySelectorAll("[class*='privateLinks'] a")].map((node) => node.textContent?.trim()),
    timelineEntries: document.querySelectorAll("[aria-label='原始坐标时间线'] article").length,
    mainSections: document.querySelectorAll("main > section").length,
    headingSize: Number.parseFloat(getComputedStyle(document.querySelector("main h1")).fontSize),
    imageCounts: [...document.querySelectorAll("main img")].reduce((counts, image) => {
      const source = image.getAttribute("src") || "";
      const match = source.match(/url=([^&]+)/);
      const key = match ? decodeURIComponent(match[1]) : source;
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {}),
  }));
  record("homepage exposes source labels for its timeline", homeContract.sourceCaptions.length === 3 && homeContract.sourceCaptions.every((text) => /真实记录/.test(text || "")), JSON.stringify(homeContract.sourceCaptions));
  record("homepage keeps at most four quiet private links", homeContract.privateRoomLinks.length <= 4, JSON.stringify(homeContract.privateRoomLinks));
  record("homepage has three timeline moments", homeContract.timelineEntries === 3, String(homeContract.timelineEntries));
  record("homepage has three main sections", homeContract.mainSections === 3, String(homeContract.mainSections));
  record("homepage title stays within 80px", homeContract.headingSize <= 80, String(homeContract.headingSize));
  record(
    "homepage repeats no source image more than twice",
    Object.values(homeContract.imageCounts).every((count) => count <= 2),
    JSON.stringify(homeContract.imageCounts),
  );
  await homeContext.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify({ checks, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
