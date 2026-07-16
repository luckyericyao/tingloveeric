import { chromium } from "playwright-core";

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseURL = process.env.QA_URL || "http://127.0.0.1:3000";
const chapterCount = 7;

async function enterStory(page) {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  const enter = page.getByRole("button", { name: "进入故事" });
  await enter.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("进入故事"));
    return button && !button.disabled;
  });
  await enter.click();
  await page.locator("canvas").waitFor({ state: "visible", timeout: 20000 });
  await page.locator("article h2").waitFor({ state: "visible", timeout: 30000 });
  await page.locator("main[data-playback='idle']").waitFor({ state: "visible", timeout: 20000 });
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

async function waitForChapterStart(page, chapter) {
  await page.waitForFunction(
    (target) => {
      const main = document.querySelector("main");
      return Number(main?.getAttribute("data-chapter")) === target
        && ["transitioning", "playing", "settled", "completed"].includes(main?.getAttribute("data-playback") || "");
    },
    chapter,
    { timeout: 2500 },
  );
}

async function waitForChapterEnd(page, chapter, terminal = false) {
  await page.waitForFunction(
    ({ target, finalState }) => {
      const main = document.querySelector("main");
      return Number(main?.getAttribute("data-chapter")) === target
        && main?.getAttribute("data-playback") === finalState
        && Number(main?.getAttribute("data-max-viewed")) >= target;
    },
    { target: chapter, finalState: terminal ? "completed" : "settled" },
    { timeout: 15000 },
  );
}

async function wheelForward(page) {
  await page.mouse.move(720, 420);
  await page.mouse.wheel(0, 34);
}

async function clickBlankScene(page, width) {
  await page.mouse.click(Math.round(width * 0.5), 150);
}

async function swipeUp(page, x = 195, startY = 520) {
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y: startY }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: startY - 32 }],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}

function captureFailures(page, errors, failedRequests) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText || "failed";
    if (!(request.resourceType() === "media" && failure === "net::ERR_ABORTED")) {
      failedRequests.push(`${request.method()} ${request.url()} ${failure}`);
    }
  });
}

async function testWheelJourney(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  captureFailures(page, errors, failedRequests);
  await enterStory(page);

  const hint = await page.getByText("轻轻滑动，故事会自己向前。").isVisible();
  const futureDot = page.locator("nav button").nth(4);
  await futureDot.dispatchEvent("click");
  const futureNotice = await page.getByText("故事会带你走到那里").isVisible();
  const stateAfterFutureClick = await storyState(page);

  await wheelForward(page);
  await waitForChapterStart(page, 1);
  const hintGone = !(await page.getByText("轻轻滑动，故事会自己向前。").isVisible());
  await page.locator("main").evaluate((main) => {
    for (let index = 0; index < 8; index += 1) {
      main.dispatchEvent(new WheelEvent("wheel", { deltaY: 42, bubbles: true, cancelable: true }));
    }
  });
  await page.waitForTimeout(600);
  const inertiaState = await storyState(page);
  await page.screenshot({ path: "/tmp/ting-story-wheel-transition-desktop.png" });
  await waitForChapterEnd(page, 1);
  const firstSettled = await storyState(page);
  await page.screenshot({ path: "/tmp/ting-story-wheel-settled-desktop.png" });

  for (let chapter = 2; chapter < chapterCount; chapter += 1) {
    await wheelForward(page);
    await waitForChapterStart(page, chapter);
    await waitForChapterEnd(page, chapter, chapter === chapterCount - 1);
  }
  const finale = await storyState(page);
  await page.screenshot({ path: "/tmp/ting-story-wheel-finale-desktop.png" });

  const chapterDots = page.locator("nav button[aria-label^='返回']");
  await chapterDots.first().click();
  await page.locator("main[data-chapter='0'][data-playback='settled']").waitFor({ timeout: 2500 });
  const returned = await storyState(page);

  await context.close();
  return {
    hint,
    hintGone,
    futureNotice,
    stateAfterFutureClick,
    inertiaState,
    firstSettled,
    finale,
    returned,
    errors,
    failedRequests,
  };
}

async function testClickJourney(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  captureFailures(page, errors, failedRequests);
  await enterStory(page);

  for (let chapter = 1; chapter < chapterCount; chapter += 1) {
    await clickBlankScene(page, 1440);
    await waitForChapterStart(page, chapter);
    await waitForChapterEnd(page, chapter, chapter === chapterCount - 1);
  }

  const finale = await storyState(page);
  await page.screenshot({ path: "/tmp/ting-story-click-finale-desktop.png" });
  await context.close();
  return { finale, errors, failedRequests };
}

async function testTouchJourney(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  captureFailures(page, errors, failedRequests);
  await enterStory(page);

  await swipeUp(page);
  await waitForChapterStart(page, 1);
  await swipeUp(page);
  await swipeUp(page);
  await page.waitForTimeout(600);
  const lockedState = await storyState(page);
  await waitForChapterEnd(page, 1);
  const settled = await storyState(page);
  await page.screenshot({ path: "/tmp/ting-story-touch-settled-mobile.png" });

  await context.close();
  return { lockedState, settled, errors, failedRequests };
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader", "--hide-scrollbars"],
});

try {
  const wheel = await testWheelJourney(browser);
  const click = await testClickJourney(browser);
  const touch = await testTouchJourney(browser);
  const result = { wheel, click, touch };

  const failures = [];
  if (!wheel.hint || !wheel.hintGone) failures.push("one-time gesture hint failed");
  if (!wheel.futureNotice || wheel.stateAfterFutureClick.chapter !== 0) failures.push("future chapter lock failed");
  if (wheel.inertiaState.chapter !== 1) failures.push("wheel inertia skipped a chapter");
  if (wheel.finale.chapter !== 6 || wheel.finale.playback !== "completed") failures.push("wheel-only journey did not complete");
  if (wheel.returned.chapter !== 0 || wheel.returned.maxViewed !== 6) failures.push("viewed chapter return failed");
  if (click.finale.chapter !== 6 || click.finale.playback !== "completed") failures.push("click-only journey did not complete");
  if (touch.lockedState.chapter !== 1 || touch.settled.chapter !== 1) failures.push("touch input double-triggered");
  if ([wheel, click, touch].some((item) => item.errors.length || item.failedRequests.length)) failures.push("browser errors detected");
  if ([wheel.finale, click.finale, touch.settled].some((item) => item.scrollY !== 0 || item.bodyOverflow > 0)) failures.push("page scroll penetration detected");

  console.log(JSON.stringify({ ...result, failures }, null, 2));
  if (failures.length > 0) process.exitCode = 1;
} finally {
  await browser.close();
}
