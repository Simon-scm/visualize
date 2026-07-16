import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { syncVisualizeMd } from "../../src/config/write-visualize-md.js";
import { withTempProject } from "../helpers/temp-project.js";

describe("syncVisualizeMd", () => {
  it("updates only the managed workflow block", async () => {
    await withTempProject(async () => {
      await syncVisualizeMd("manual");
      const filePath = path.join(process.cwd(), "VISUALIZE.md");
      await fs.appendFile(filePath, "\nCustom project instruction.\n");

      await syncVisualizeMd("watch");
      const watchMarkdown = await fs.readFile(filePath, "utf8");
      expect(watchMarkdown).toContain("Watch mode is currently running");
      expect(watchMarkdown).toContain("Custom project instruction.");
      expect(watchMarkdown).not.toContain("visualize capture");

      await syncVisualizeMd("manual");
      const manualMarkdown = await fs.readFile(filePath, "utf8");
      expect(manualMarkdown).toContain("Manual capture is currently active");
      expect(manualMarkdown).toContain("visualize capture");
      expect(manualMarkdown).toContain("Custom project instruction.");
    });
  });

  it("migrates the legacy generated workflow section", async () => {
    await withTempProject(async () => {
      await fs.writeFile(
        "VISUALIZE.md",
        "# Visualize\n\n## Updating visual context\n\nWatch mode is currently disabled.\n\n## Notes\n\nKeep this note.\n"
      );

      await syncVisualizeMd("watch");
      const markdown = await fs.readFile("VISUALIZE.md", "utf8");

      expect(markdown).toContain("<!-- visualize:workflow:start -->");
      expect(markdown).toContain("Watch mode is currently running");
      expect(markdown).toContain("Keep this note.");
      expect(markdown).not.toContain("currently disabled");
    });
  });
});
