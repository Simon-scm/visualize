import os from "node:os";
import path from "node:path";
import fs from "fs-extra";

export async function withTempProject(
  fn: (dir: string) => Promise<void>
): Promise<void> {
  const originalCwd = process.cwd();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "visualize-test-"));

  try {
    process.chdir(tempDir);
    await fn(tempDir);
  } finally {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  }
}
