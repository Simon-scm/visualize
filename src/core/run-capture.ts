import type { Browser } from "playwright";
import type { VisualizeWorkflow } from "../config/build-visualize-md.js";
import { loadConfig } from "../config/load-config.js";
import { syncVisualizeMd } from "../config/write-visualize-md.js";
import { ensureOutputStructure } from "../output/ensure-output-structure.js";
import type { ManifestCapture } from "../output/manifest.js";
import { writeManifest } from "../output/write-manifest.js";
import { writeReport } from "../output/write-report.js";
import { launchBrowser } from "../renderer/browser.js";
import { captureRoute } from "../renderer/capture-route.js";
import { logger } from "../utils/logger.js";
import { getActiveWatchPid } from "../watch/watch-state.js";

export async function runCapture(options?: {
  changedFiles?: string[];
  reason?: "manual" | "watch";
}): Promise<void> {
  const config = await loadConfig();
  await ensureOutputStructure(config.outputDir);
  const workflow: VisualizeWorkflow =
    options?.reason === "watch" || (await getActiveWatchPid(config.outputDir))
      ? "watch"
      : "manual";
  await syncVisualizeMd(workflow);

  if (options?.reason === "watch" && options.changedFiles?.length) {
    logger.info("Capture triggered by file changes:");
    for (const changedFile of options.changedFiles) {
      logger.info(`  ${changedFile}`);
    }
    logger.info("");
  }

  let browser: Browser | undefined;
  const captures: ManifestCapture[] = [];

  try {
    browser = await launchBrowser();

    for (const route of config.routes) {
      for (const viewport of config.viewports) {
        captures.push(
          await captureRoute({
            browser,
            config,
            route,
            viewport
          })
        );
      }
    }
  } finally {
    await browser?.close().catch(() => undefined);
  }

  const manifest = await writeManifest({ config, captures });
  const reportPath = await writeReport({
    manifest,
    outputDir: config.outputDir,
    workflow
  });

  const successfulCount = captures.filter(
    (capture) => capture.status === "ok"
  ).length;
  const failedCount = captures.filter(
    (capture) => capture.status === "failed"
  ).length;

  logger.info("Captures complete.");
  logger.info("");
  logger.info("Successful:");
  logger.info(`  ${successfulCount}`);
  logger.info("");
  logger.info("Failed:");
  logger.info(`  ${failedCount}`);
  logger.info("");
  logger.info("Manifest written:");
  logger.info(`  ${config.outputDir}/manifest.json`);
  logger.info("");
  logger.info("Report written:");
  logger.info(`  ${reportPath}`);
}
