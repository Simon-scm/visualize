import { describe, expect, it } from "vitest";
import { buildVisualizeMd } from "../../src/config/build-visualize-md.js";
import { defaultConfig } from "../../src/config/default-config.js";

describe("buildVisualizeMd", () => {
  it("describes manual capture when watch mode is disabled", () => {
    const markdown = buildVisualizeMd({
      ...defaultConfig,
      watch: {
        enabled: false,
        include: [],
        exclude: []
      }
    });

    expect(markdown).toContain(".visualize/reports/context.md");
    expect(markdown).toContain(".visualize/latest/screenshots/");
    expect(markdown).toContain("visualize capture");
    expect(markdown).not.toContain(
      "Visual context is expected to be updated automatically"
    );
  });

  it("describes watch mode when watch mode is enabled", () => {
    const markdown = buildVisualizeMd({
      ...defaultConfig,
      watch: {
        enabled: true,
        include: [],
        exclude: []
      }
    });

    expect(markdown).toContain(".visualize/reports/context.md");
    expect(markdown).toContain(".visualize/latest/screenshots/");
    expect(markdown).toContain("visualize watch");
    expect(markdown).not.toContain("visualize capture");
  });
});
