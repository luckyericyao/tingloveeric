import { chromium } from "playwright-core";
import { PNG } from "pngjs";

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseURL = process.env.QA_URL || "http://127.0.0.1:3000";

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
  await page.waitForTimeout(options.reducedMotion === "reduce" ? 400 : 1600);

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
    for (const route of ["/her", "/story", "/world", "/board"]) {
      const response = await context.request.get(`${baseURL}${route}`);
      routeStatuses[route] = response.status();
    }
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
    consoleErrors,
    failedRequests,
  };
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

  console.log(JSON.stringify({ desktop, mobile, reducedMotion }, null, 2));
} finally {
  await browser.close();
}
