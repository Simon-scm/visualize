import path from "node:path";
import fs from "fs-extra";
import YAML from "yaml";
import { ZodError } from "zod";
import {
  visualizeConfigSchema,
  type VisualizeConfig
} from "./schema.js";

const CONFIG_FILE_NAME = "visualize.config.yml";

export async function loadConfig(configPath?: string): Promise<VisualizeConfig> {
  const resolvedConfigPath =
    configPath ?? path.join(process.cwd(), CONFIG_FILE_NAME);

  if (!(await fs.pathExists(resolvedConfigPath))) {
    throw new Error(`${CONFIG_FILE_NAME} not found. Run "visualize init" first.`);
  }

  const configFile = await fs.readFile(resolvedConfigPath, "utf8");
  const parsedYaml = YAML.parse(configFile);

  try {
    return visualizeConfigSchema.parse(parsedYaml);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(formatConfigError(error));
    }

    throw error;
  }
}

function formatConfigError(error: ZodError): string {
  const issues = error.issues
    .map((issue) => {
      const fieldPath = issue.path.join(".") || "<root>";
      return `- ${fieldPath}: ${issue.message}`;
    })
    .join("\n");

  return `Invalid ${CONFIG_FILE_NAME}:\n\n${issues}`;
}
