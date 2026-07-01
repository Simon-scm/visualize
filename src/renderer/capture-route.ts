import path from "node:path";
import type { Browser, Page } from "playwright";
import type { VisualizeConfig } from "../config/schema.js";
import type { ManifestCapture } from "../output/manifest.js";
import { stabilizePage } from "./stabilize-page.js";

export async function captureRoute(params: {
  browser: Browser;
  config: VisualizeConfig;
  route: VisualizeConfig["routes"][number];
  viewport: VisualizeConfig["viewports"][number];
}): Promise<ManifestCapture> {
  const { browser, config, route, viewport } = params;
  const screenshot = toManifestPath(
    config.outputDir,
    "latest",
    "screenshots",
    `${route.name}.${viewport.name}.png`
  );
  const screenshotPath = path.join(
    config.outputDir,
    "latest",
    "screenshots",
    `${route.name}.${viewport.name}.png`
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

  try {
    page = await browser.newPage({
      viewport: {
        width: viewport.width,
        height: viewport.height
      }
    });

    await page.goto(buildUrl(config.baseUrl, route.path), {
      waitUntil: config.stabilize.waitUntil
    });
    await stabilizePage(page, config);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return {
      ...captureBase,
      status: "ok"
    };
  } catch (error) {
    return {
      ...captureBase,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown capture error"
    };
  } finally {
    await page?.close().catch(() => undefined);
  }
}

function buildUrl(baseUrl: string, routePath: string): string {
  return new URL(routePath, baseUrl).toString();
}

function toManifestPath(...segments: string[]): string {
  return segments.join("/");
}
