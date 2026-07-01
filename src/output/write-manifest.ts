import path from "node:path";
import fs from "fs-extra";
import type { VisualizeConfig } from "../config/schema.js";
import type { ManifestCapture, VisualizeManifest } from "./manifest.js";

export async function writeManifest(params: {
  config: VisualizeConfig;
  captures: ManifestCapture[];
}): Promise<VisualizeManifest> {
  const manifest: VisualizeManifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: params.config.baseUrl,
    captures: params.captures
  };

  await fs.writeJson(
    path.join(params.config.outputDir, "manifest.json"),
    manifest,
    {
      spaces: 2
    }
  );

  return manifest;
}
