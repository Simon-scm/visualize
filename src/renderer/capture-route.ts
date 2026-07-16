import path from "node:path";
import type { Browser, Page, Response } from "playwright";
import type { VisualizeConfig } from "../config/schema.js";
import type { ManifestCapture } from "../output/manifest.js";
import { createScreenshotFileName } from "../utils/filename.js";
import { stabilizePage } from "./stabilize-page.js";

export async function captureRoute(params: {
  browser: Browser;
  config: VisualizeConfig;
  route: VisualizeConfig["routes"][number];
  viewport: VisualizeConfig["viewports"][number];
}): Promise<ManifestCapture> {
  const { browser, config, route, viewport } = params;
  const startedAt = Date.now();
  const requestedUrl = buildUrl(config.baseUrl, route.path);
  const screenshotFileName = createScreenshotFileName({
    routeName: route.name,
    viewportName: viewport.name
  });
  const screenshot = toManifestPath(
    config.outputDir,
    "latest",
    "screenshots",
    screenshotFileName
  );
  const screenshotPath = path.join(
    config.outputDir,
    "latest",
    "screenshots",
    screenshotFileName
  );

  const captureBase = {
    routeName: route.name,
    path: route.path,
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    screenshot
  };

  let page: Page | undefined;
  let response: Response | null = null;
  let finalUrl: string | undefined;
  let title: string | undefined;
  let consoleErrorCount = 0;
  let pageErrorCount = 0;

  try {
    page = await browser.newPage({
      viewport: {
        width: viewport.width,
        height: viewport.height
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrorCount += 1;
      }
    });
    page.on("pageerror", () => {
      pageErrorCount += 1;
    });

    response = await page.goto(requestedUrl, {
      waitUntil: config.stabilize.waitUntil,
      timeout: config.stabilize.timeoutMs
    });
    await stabilizePage(page, config);
    finalUrl = page.url();
    title = await page.title();
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return {
      ...captureBase,
      status: "ok",
      requestedUrl,
      finalUrl,
      title,
      httpStatus: response?.status(),
      consoleErrorCount,
      pageErrorCount,
      durationMs: Date.now() - startedAt
    };
  } catch (error) {
    if (page) {
      finalUrl = finalUrl ?? page.url();
      title = title ?? (await getPageTitle(page));
    }

    return {
      ...captureBase,
      status: "failed",
      requestedUrl,
      finalUrl,
      title,
      httpStatus: response?.status(),
      consoleErrorCount,
      pageErrorCount,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown capture error"
    };
  } finally {
    await page?.close().catch(() => undefined);
  }
}

function buildUrl(baseUrl: string, routePath: string): string {
  return new URL(routePath, baseUrl).toString();
}

async function getPageTitle(page: Page): Promise<string | undefined> {
  try {
    return await page.title();
  } catch {
    return undefined;
  }
}

function toManifestPath(...segments: string[]): string {
  return segments.join("/");
}
