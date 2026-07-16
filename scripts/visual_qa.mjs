import { chromium } from "playwright-core";
import { PNG } from "pngjs";

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseURL = process.env.QA_URL || "http://127.0.0.1:3000";
const generatedSceneAssets = [
  "/assets/cats/nono-front.webp",
  "/assets/cats/nono-left.webp",
  "/assets/cats/nono-right.webp",
  "/assets/cats/nono-blink.webp",
  "/assets/cats/xiaoyi-front.webp",
  "/assets/cats/xiaoyi-left.webp",
  "/assets/cats/xiaoyi-right.webp",
  "/assets/cats/xiaoyi-blink.webp",
  "/assets/butterfly/pearl-wing.webp",
];

function analyzePng(buffer) {
  const png = PNG.sync.read(buffer);
  let count = 0;
  let sum = 0;
  let sumSquares = 0;
  let bright = 0;
  let dark = 0;

  for (let y = 0; y < png.height; y += 12) {
    for (let x = 0; x < png.width; x += 12) {
      const offset = (png.width * y + x) * 4;
      const luminance = png.data[offset] * 0.2126 + png.data[offset + 1] * 0.7152 + png.data[offset + 2] * 0.0722;
      count += 1;
      sum += luminance;
      sumSquares += luminance * luminance;
      if (luminance > 90) bright += 1;
      if (luminance < 12) dark += 1;
    }
  }

  const mean = sum / count;
  const variance = sumSquares / count - mean * mean;
  return {
    width: png.width,
    height: png.height,
    meanLuminance: Number(mean.toFixed(2)),
    luminanceDeviation: Number(Math.sqrt(Math.max(0, variance)).toFixed(2)),
    brightRatio: Number((bright / count).toFixed(3)),
    darkRatio: Number((dark / count).toFixed(3)),
  };
}

async function waitForIntro(page) {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "进入故事" }).waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("进入故事"));
    return button && !button.disabled;
  });
}

async function runViewport(browser, options) {
  const context = await browser.newContext({
    viewport: options.viewport,
    deviceScaleFactor: 1,
    hasTouch: options.hasTouch,
    isMobile: options.hasTouch,
    reducedMotion: options.reducedMotion || "no-preference",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText || "failed";
    const isExpectedMediaAbort = request.resourceType() === "media" && errorText === "net::ERR_ABORTED";
    if (!isExpectedMediaAbort) failedRequests.push(`${request.method()} ${request.url()} ${errorText}`);
  });

  await waitForIntro(page);
  const audioBeforeEntry = await page.locator("audio").evaluate((audio) => ({
    paused: audio.paused,
    currentTime: audio.currentTime,
  }));
  await page.screenshot({ path: options.introPath });
  await page.getByRole("button", { name: "进入故事" }).click();
  await page.locator("article h2").waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(options.reducedMotion === "reduce" ? 120 : 1000);

  const canvas = page.locator("canvas");
  await canvas.waitFor({ state: "visible" });
  const canvasBuffer = await canvas.screenshot();
  const canvasPixels = analyzePng(canvasBuffer);
  await page.screenshot({ path: options.storyPath });

  const interactionChecks = {};
  if (options.checkControls) {
    await page.getByRole("button", { name: "静音" }).click();
    interactionChecks.mutedVolume = await page.locator("audio").evaluate((audio) => audio.volume);
    await page.getByRole("button", { name: "取消静音" }).click();

    const slider = page.getByRole("slider", { name: "音乐音量" });
    await slider.fill("0.28");
    interactionChecks.adjustedVolume = await page.locator("audio").evaluate((audio) => audio.volume);

    await page.getByRole("button", { name: "切换到简化模式" }).click();
    interactionChecks.quietMode = await page.locator("main").getAttribute("data-quality");
    await page.getByRole("button", { name: "切换到电影模式" }).click();
    interactionChecks.cinematicMode = await page.locator("main").getAttribute("data-quality");
  }

  if (options.advanceToShanghai) {
    const next = page.getByRole("button", { name: "下一幕" });
    for (let step = 0; step < 4; step += 1) {
      await next.click();
      await page.waitForTimeout(options.reducedMotion === "reduce" ? 120 : 480);
    }
    await page.screenshot({ path: options.shanghaiPath });
  }

  if (options.testSwipe) {
    const main = page.locator("main");
    await main.dispatchEvent("pointerdown", { clientX: 330, clientY: 180, pointerType: "touch" });
    await main.dispatchEvent("pointerup", { clientX: 80, clientY: 180, pointerType: "touch" });
    await page.waitForTimeout(options.reducedMotion === "reduce" ? 120 : 520);
    interactionChecks.swipeTitle = await page.locator("article h2").textContent();
  }

  let finale = null;
  if (options.advanceToFinale) {
    const next = page.getByRole("button", { name: "下一幕" });
    while (!(await next.isDisabled())) {
      await next.click();
      await page.waitForTimeout(options.reducedMotion === "reduce" ? 100 : 430);
    }
    await page.screenshot({ path: options.finalePath });
    finale = {
      title: await page.locator("article h2").textContent(),
      nextDisabled: await next.isDisabled(),
      actionVisible: await page.getByRole("link", { name: "写下此刻" }).isVisible(),
    };
  }

  const routeStatuses = {};
  if (options.checkRoutes) {
    for (const route of ["/her", "/story", "/world", "/board", "/coordinates"]) {
      const response = await context.request.get(`${baseURL}${route}`);
      routeStatuses[route] = response.status();
    }
  }

  const assetStatuses = {};
  if (options.checkAssets) {
    for (const asset of generatedSceneAssets) {
      const response = await context.request.get(`${baseURL}${asset}`);
      assetStatuses[asset] = {
        status: response.status(),
        contentType: response.headers()["content-type"],
      };
    }

    const failedAssets = Object.entries(assetStatuses).filter(([, result]) => result.status !== 200);
    if (failedAssets.length > 0) throw new Error(`Generated scene assets failed: ${JSON.stringify(failedAssets)}`);
  }

  const state = await page.evaluate(() => {
    const audio = document.querySelector("audio");
    const canvasElement = document.querySelector("canvas");
    return {
      title: document.querySelector("article h2")?.textContent?.trim() || "",
      sections: document.querySelectorAll("main > section").length,
      canvas: canvasElement
        ? {
            width: canvasElement.width,
            height: canvasElement.height,
            cssWidth: canvasElement.getBoundingClientRect().width,
            cssHeight: canvasElement.getBoundingClientRect().height,
          }
        : null,
      audio: audio
        ? {
            paused: audio.paused,
            muted: audio.muted,
            volume: audio.volume,
            readyState: audio.readyState,
          }
        : null,
      bodyOverflowX: document.body.scrollWidth - document.documentElement.clientWidth,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
  });

  await context.close();
  return {
    ...state,
    audioBeforeEntry,
    canvasPixels,
    interactionChecks,
    finale,
    routeStatuses,
    assetStatuses,
    consoleErrors,
    failedRequests,
  };
}

async function runCoordinatesViewport(browser, options) {
  const context = await browser.newContext({
    viewport: options.viewport,
    deviceScaleFactor: 1,
    hasTouch: options.hasTouch,
    isMobile: options.hasTouch,
    reducedMotion: options.reducedMotion || "no-preference",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || "failed"}`);
  });

  await page.goto(`${baseURL}/coordinates`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "我们最初在 Soul 相遇" }).waitFor({ state: "visible" });
  await page.screenshot({ path: options.heroPath });

  const firstArchiveImage = page.getByRole("button", { name: "沉浸查看：那时候她叫 Hanni" });
  await firstArchiveImage.scrollIntoViewIfNeeded();
  await firstArchiveImage.click();
  await page.getByRole("dialog", { name: "查看图片：那时候她叫 Hanni" }).waitFor({ state: "visible" });
  await page.screenshot({ path: options.viewerPath });
  await page.getByRole("button", { name: "下一张图片" }).click();
  const viewerAdvanced = await page.getByRole("dialog", { name: "查看图片：她最早向外展示的生活" }).isVisible();
  const closeButtons = page.getByRole("button", { name: "关闭图片" });
  await closeButtons.nth(1).click();

  const catsHeading = page.getByRole("heading", { name: "诺诺与小伊" });
  await catsHeading.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
    undefined,
    { timeout: 10000 },
  );
  await page.waitForTimeout(options.reducedMotion === "reduce" ? 80 : 950);
  await page.screenshot({ path: options.catsPath });

  const state = await page.evaluate(() => ({
    bodyOverflowX: document.body.scrollWidth - document.documentElement.clientWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    images: Array.from(document.images).map((image) => ({
      alt: image.alt,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
    })),
  }));

  await context.close();
  return { ...state, viewerAdvanced, consoleErrors, failedRequests };
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader", "--hide-scrollbars"],
});

try {
  const desktop = await runViewport(browser, {
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
    introPath: "/tmp/ting-3d-intro-desktop.png",
    storyPath: "/tmp/ting-3d-story-desktop.png",
    shanghaiPath: "/tmp/ting-3d-shanghai-desktop.png",
    finalePath: "/tmp/ting-3d-finale-desktop.png",
    advanceToShanghai: true,
    advanceToFinale: true,
    checkControls: true,
    checkRoutes: true,
    checkAssets: true,
  });

  const mobile = await runViewport(browser, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    introPath: "/tmp/ting-3d-intro-mobile.png",
    storyPath: "/tmp/ting-3d-story-mobile.png",
    advanceToShanghai: false,
    testSwipe: true,
  });

  const reducedMotion = await runViewport(browser, {
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    reducedMotion: "reduce",
    introPath: "/tmp/ting-3d-intro-reduced.png",
    storyPath: "/tmp/ting-3d-story-reduced.png",
    advanceToShanghai: false,
  });

  const coordinatesDesktop = await runCoordinatesViewport(browser, {
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
    heroPath: "/tmp/ting-coordinates-hero-desktop.png",
    viewerPath: "/tmp/ting-coordinates-viewer-desktop.png",
    catsPath: "/tmp/ting-coordinates-cats-desktop.png",
  });

  const coordinatesMobile = await runCoordinatesViewport(browser, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    heroPath: "/tmp/ting-coordinates-hero-mobile.png",
    viewerPath: "/tmp/ting-coordinates-viewer-mobile.png",
    catsPath: "/tmp/ting-coordinates-cats-mobile.png",
  });

  const coordinatesReducedMotion = await runCoordinatesViewport(browser, {
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
    reducedMotion: "reduce",
    heroPath: "/tmp/ting-coordinates-hero-reduced.png",
    viewerPath: "/tmp/ting-coordinates-viewer-reduced.png",
    catsPath: "/tmp/ting-coordinates-cats-reduced.png",
  });

  console.log(JSON.stringify({
    desktop,
    mobile,
    reducedMotion,
    coordinatesDesktop,
    coordinatesMobile,
    coordinatesReducedMotion,
  }, null, 2));
} finally {
  await browser.close();
}
