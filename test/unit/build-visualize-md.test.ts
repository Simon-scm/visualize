import { describe, expect, it } from "vitest";
import { buildVisualizeMd } from "../../src/config/build-visualize-md.js";

describe("buildVisualizeMd", () => {
  it("describes manual capture by default", () => {
    const markdown = buildVisualizeMd();

    expect(markdown).toContain(".visualize/reports/context.md");
    expect(markdown).toContain(".visualize/latest/screenshots/");
    expect(markdown).toContain("visualize capture");
    expect(markdown).not.toContain(
      "Visual context is expected to be updated automatically"
    );
  });

  it("describes watch mode while the watcher is running", () => {
    const markdown = buildVisualizeMd("watch");

    expect(markdown).toContain(".visualize/reports/context.md");
    expect(markdown).toContain(".visualize/latest/screenshots/");
    expect(markdown).toContain("visualize watch");
    expect(markdown).not.toContain("visualize capture");
  });
});
