import type { Command } from "commander";
import { loadConfig } from "../config/load-config.js";
import { logger } from "../utils/logger.js";

export function registerCaptureCommand(program: Command): void {
  program
    .command("capture")
    .description("Load the visualize config and prepare a capture run.")
    .action(async () => {
      const config = await loadConfig();

      logger.info("Loaded visualize.config.yml");
      logger.info("");
      logger.info("Base URL:");
      logger.info(`  ${config.baseUrl}`);
      logger.info("");
      logger.info("Routes:");
      for (const route of config.routes) {
        logger.info(`  - ${route.name} (${route.path})`);
      }
      logger.info("");
      logger.info("Viewports:");
      for (const viewport of config.viewports) {
        logger.info(`  - ${viewport.name} ${viewport.width}x${viewport.height}`);
      }
      logger.info("");
      logger.info("Output directory:");
      logger.info(`  ${config.outputDir}`);
      logger.info("");
      logger.info("Capture engine is not implemented yet.");
    });
}
