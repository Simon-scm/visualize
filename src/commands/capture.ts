import type { Command } from "commander";
import type { Browser } from "playwright";
import { loadConfig } from "../config/load-config.js";
import { ensureOutputStructure } from "../output/ensure-output-structure.js";
import type { ManifestCapture } from "../output/manifest.js";
import { writeManifest } from "../output/write-manifest.js";
import { launchBrowser } from "../renderer/browser.js";
import { captureRoute } from "../renderer/capture-route.js";
import { logger } from "../utils/logger.js";

export function registerCaptureCommand(program: Command): void {
  program
    .command("capture")
    .description("Load the visualize config and prepare a capture run.")
    .action(async () => {
      const config = await loadConfig();
      await ensureOutputStructure(config.outputDir);

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

      await writeManifest({ config, captures });

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
    });
}
