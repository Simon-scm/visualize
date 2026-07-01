import path from "node:path";
import fs from "fs-extra";

export async function ensureOutputStructure(outputDir: string): Promise<void> {
  await fs.ensureDir(path.join(outputDir, "latest", "screenshots"));
  await fs.ensureDir(path.join(outputDir, "reports"));
}
