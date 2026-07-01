import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config/load-config.js";
import { withTempProject } from "../helpers/temp-project.js";

const validConfig = `baseUrl: http://localhost:5173
routes:
  - name: home
    path: /
viewports:
  - name: mobile
    width: 390
    height: 844
outputDir: .visualize
watch:
  enabled: false
  include: []
  exclude: []
stabilize:
  waitUntil: networkidle
  disableAnimations: true
  waitMs: 300
`;

describe("loadConfig", () => {
  it("loads a valid config from the current working directory", async () => {
    await withTempProject(async () => {
      await fs.writeFile(path.join(process.cwd(), "visualize.config.yml"), validConfig);

      const config = await loadConfig();

      expect(config.baseUrl).toBe("http://localhost:5173");
      expect(config.routes).toEqual([{ name: "home", path: "/" }]);
      expect(config.viewports).toEqual([
        { name: "mobile", width: 390, height: 844 }
      ]);
      expect(config.watch.enabled).toBe(false);
    });
  });

  it("fails clearly when the config file is missing", async () => {
    await withTempProject(async () => {
      await expect(loadConfig()).rejects.toThrow("visualize.config.yml not found");
    });
  });

  it("formats validation errors for invalid config fields", async () => {
    await withTempProject(async () => {
      await fs.writeFile(
        path.join(process.cwd(), "visualize.config.yml"),
        validConfig.replace("width: 390", "width: wrong")
      );

      await expect(loadConfig()).rejects.toThrow("viewports.0.width");
    });
  });
});
