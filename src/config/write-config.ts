import fs from "fs-extra";
import YAML from "yaml";
import { visualizeConfigSchema, type VisualizeConfig } from "./schema.js";

export async function writeConfig(
  configPath: string,
  config: VisualizeConfig
): Promise<void> {
  const parsedConfig = visualizeConfigSchema.parse(config);
  const yaml = YAML.stringify(parsedConfig, {
    lineWidth: 0,
    singleQuote: false
  });

  await fs.outputFile(configPath, yaml);
}
