import { chromium } from "playwright-core";

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseURL = process.env.QA_URL || "http://127.0.0.1:3000";
const storyURL = `${baseURL}/cinema`;
const chapterCount = 6;
const musicDuration = 254.4;
const chapterCues = [0, 0.14, 0.3, 0.47, 0.65, 0.82];

function captureFailures(page, errors, failedRequests) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText || "failed";
    const isExpectedMediaAbort = failure === "net::ERR_ABORTED"
      && (request.resourceType() === "media" || /\.(?:m4a|mp3|wav|flac)(?:\?|$)/i.test(request.url()));
    if (!isExpectedMediaAbort) {
      failedRequests.push(`${request.method()} ${request.url()} ${failure}`);
    }
  });
}

async function enterStory(page) {
  await page.goto(storyURL, { waitUntil: "domcontentloaded" });
  const enter = page.getByRole("button", { name: "进入故事" });
  await enter.waitFor({ state: "visible" });
  const openingAudioSource = await page.locator("audio").evaluate((audio) => audio.currentSrc);
  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("进入故事"));
    return button && !button.disabled;
  }, null, { timeout: 10000 });
  await enter.click();
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20000 });
  await page.locator("article h2").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForFunction(() => document.querySelector("[aria-label='甜蜜的序幕']")?.className.includes("preludeHidden"), null, { timeout: 30000 });
  await page.waitForFunction(() => document.querySelector("main")?.dataset.playback === "playing", null, { timeout: 30000 });
  await page.waitForTimeout(500);
  return openingAudioSource;
}

async function storyState(page) {
  return page.locator("main").evaluate((main) => ({
    chapter: Number(main.dataset.chapter),
    maxViewed: Number(main.dataset.maxViewed),
    playback: main.dataset.playback,
    scrollY: window.scrollY,
    bodyOverflow: document.body.scrollHeight - window.innerHeight,
  }));
}

async function seekFilmToChapter(page, chapter) {
  const targetTime = Math.max(0.05, musicDuration * chapterCues[chapter] + 0.05);
  await page.locator("audio").evaluate((audio, time) => {
    audio.currentTime = time;
    audio.dispatchEvent(new Event("timeupdate", { bubbles: true }));
  }, targetTime);
  await page.waitForFunction(
    (target) => Number(document.querySelector("main")?.dataset.chapter) === target
      && document.querySelector("main")?.dataset.playback === "playing",
    chapter,
    { timeout: 5000 },
  );
}

async function finishFilm(page) {
  await page.locator("audio").evaluate((audio) => audio.dispatchEvent(new Event("ended", { bubbles: true })));
  await page.waitForFunction(() => document.querySelector("main")?.dataset.playback === "completed", null, { timeout: 5000 });
}

async function assertGesturesDoNotAdvance(page) {
  const before = await storyState(page);
  await page.mouse.move(720, 420);
  await page.mouse.wheel(0, 160);
  await page.mouse.click(720, 150);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(450);
  const after = await storyState(page);
  return {
    unchanged: before.chapter === after.chapter && before.playback === after.playback,
    before,
    after,
  };
}

async function runJourney(browser, viewport, touch = false) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  captureFailures(page, errors, failedRequests);
  const openingAudioSource = await enterStory(page);

  const audioSource = await page.locator("audio").evaluate((audio) => audio.currentSrc);
  const visibleButtonsBeforeFinish = await page.locator("main").evaluate((main) => Array.from(main.querySelectorAll("button")).filter((button) => {
    const styles = getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    return styles.display !== "none"
      && styles.visibility !== "hidden"
      && Number(styles.opacity) > 0
      && styles.pointerEvents !== "none"
      && rect.width > 0
      && rect.height > 0;
  }).length);
  const gestures = await assertGesturesDoNotAdvance(page);
  await page.screenshot({ path: touch ? "/tmp/ting-story-controlled-mobile.png" : "/tmp/ting-story-controlled-desktop.png", timeout: 90000 });

  for (let chapter = 1; chapter < chapterCount; chapter += 1) await seekFilmToChapter(page, chapter);
  await finishFilm(page);
  const finale = await storyState(page);
  const worldLink = await page.getByRole("link", { name: "去世界地图" }).isVisible();
  await page.screenshot({ path: touch ? "/tmp/ting-story-controlled-finale-mobile.png" : "/tmp/ting-story-controlled-finale-desktop.png", timeout: 90000 });

  const result = { openingAudioSource, audioSource, visibleButtonsBeforeFinish, gestures, finale, worldLink, errors, failedRequests };
  await context.close();
  return result;
}

async function runTouchOnly(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  captureFailures(page, errors, failedRequests);
  await enterStory(page);
  const before = await storyState(page);
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 520 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 450 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await session.detach();
  await page.waitForTimeout(450);
  const after = await storyState(page);
  await context.close();
  return { unchanged: before.chapter === after.chapter, before, after, errors, failedRequests };
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader", "--hide-scrollbars"],
});

try {
  const desktop = await runJourney(browser, { width: 1440, height: 900 });
  const mobile = await runJourney(browser, { width: 390, height: 844 }, true);
  const touch = await runTouchOnly(browser);
  const result = { desktop, mobile, touch };
  const failures = [];

  for (const [label, item] of [["desktop", desktop], ["mobile", mobile]]) {
    if (item.openingAudioSource && !item.openingAudioSource.includes("jiu-shi-ai-ni")) failures.push(`${label} did not start with the opening theme song`);
    if (item.audioSource && !item.audioSource.includes("wo-shi-yi-zhi-yu")) failures.push(`${label} did not start the story theme song`);
    if (item.visibleButtonsBeforeFinish !== 0) failures.push(`${label} exposed non-cat controls during film`);
    if (!item.gestures.unchanged) failures.push(`${label} gesture changed the controlled film`);
    if (item.finale.chapter !== chapterCount - 1 || item.finale.playback !== "completed") failures.push(`${label} film did not finish at final chapter`);
    if (!item.worldLink) failures.push(`${label} world map exit did not unlock at the end`);
    if (item.errors.length || item.failedRequests.length) failures.push(`${label} browser errors detected`);
    if (item.finale.scrollY !== 0 || item.finale.bodyOverflow > 0) failures.push(`${label} page scroll penetration detected`);
  }
  if (!touch.unchanged || touch.errors.length || touch.failedRequests.length) failures.push("touch changed or errored during the film");

  console.log(JSON.stringify({ ...result, failures }, null, 2));
  if (failures.length > 0) process.exitCode = 1;
} finally {
  await browser.close();
}
