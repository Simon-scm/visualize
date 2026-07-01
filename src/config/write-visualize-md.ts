import path from "node:path";
import fs from "fs-extra";
import { buildVisualizeMd } from "./build-visualize-md.js";
import type { VisualizeConfig } from "./schema.js";

const VISUALIZE_MD_FILE_NAME = "VISUALIZE.md";

export async function writeVisualizeMdIfMissing(
  config: VisualizeConfig
): Promise<{
  path: string;
  created: boolean;
}> {
  const visualizeMdPath = path.join(process.cwd(), VISUALIZE_MD_FILE_NAME);

  if (await fs.pathExists(visualizeMdPath)) {
    return {
      path: visualizeMdPath,
      created: false
    };
  }

  await fs.outputFile(visualizeMdPath, buildVisualizeMd(config));

  return {
    path: visualizeMdPath,
    created: true
  };
}
