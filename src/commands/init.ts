import type { Command } from "commander";
import path from "node:path";
import fs from "fs-extra";
import { defaultConfig } from "../config/default-config.js";
import { loadConfig } from "../config/load-config.js";
import { writeConfig } from "../config/write-config.js";
import { syncVisualizeMd } from "../config/write-visualize-md.js";
import { logger } from "../utils/logger.js";
import { getActiveWatchPid } from "../watch/watch-state.js";

const CONFIG_FILE_NAME = "visualize.config.yml";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a visualize.config.yml file in the current directory.")
    .action(async () => {
      const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);
      let config = defaultConfig;

      if (await fs.pathExists(configPath)) {
        logger.info(`${CONFIG_FILE_NAME} already exists. Leaving it unchanged.`);
        config = await loadConfig(configPath);
      } else {
        await writeConfig(configPath, defaultConfig);
        logger.success(`${CONFIG_FILE_NAME} created.`);
      }

      const workflow = (await getActiveWatchPid(config.outputDir))
        ? "watch"
        : "manual";
      const visualizeMd = await syncVisualizeMd(workflow);
      if (visualizeMd.created) {
        logger.success("VISUALIZE.md created.");
      } else {
        logger.info("VISUALIZE.md workflow synchronized.");
      }
    });
}
