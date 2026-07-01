import type { Command } from "commander";
import path from "node:path";
import fs from "fs-extra";
import { defaultConfig } from "../config/default-config.js";
import { writeConfig } from "../config/write-config.js";
import { logger } from "../utils/logger.js";

const CONFIG_FILE_NAME = "visualize.config.yml";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a visualize.config.yml file in the current directory.")
    .action(async () => {
      const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);

      if (await fs.pathExists(configPath)) {
        logger.info(`${CONFIG_FILE_NAME} already exists. Leaving it unchanged.`);
        return;
      }

      await writeConfig(configPath, defaultConfig);
      logger.success(`Created ${CONFIG_FILE_NAME}.`);
    });
}
