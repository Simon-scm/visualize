import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../../src/config/default-config.js";
import type { VisualizeManifest } from "../../src/output/manifest.js";
import { writeReport } from "../../src/output/write-report.js";
import { withTempProject } from "../helpers/temp-project.js";

const manifest: VisualizeManifest = {
  generatedAt: "2026-07-01T12:00:00.000Z",
  baseUrl: "http://localhost:5173",
  captures: [
    {
      routeName: "home",
      path: "/",
      viewport: "mobile",
      width: 390,
      height: 844,
      screenshot: ".visualize/latest/screenshots/home.mobile.png",
      status: "ok",
      requestedUrl: "http://localhost:5173/",
      finalUrl: "http://localhost:5173/",
      title: "Home",
      httpStatus: 200,
      consoleErrorCount: 0,
      pageErrorCount: 0,
      durationMs: 421
    },
    {
      routeName: "login",
      path: "/login",
      viewport: "desktop",
      width: 1440,
      height: 900,
      screenshot: ".visualize/latest/screenshots/login.desktop.png",
      status: "failed",
      requestedUrl: "http://localhost:5173/login",
      finalUrl: "about:blank",
      consoleErrorCount: 0,
      pageErrorCount: 0,
      durationMs: 99,
      error: "Connection refused"
    }
  ]
};

describe("writeReport", () => {
  it("writes a report with manual capture instructions when watch is disabled", async () => {
    await withTempProject(async () => {
      const reportPath = await writeReport({
        manifest,
        outputDir: ".visualize",
        config: {
          ...defaultConfig,
          watch: {
            enabled: false,
            include: [],
            exclude: []
          }
        }
      });

      const report = await fs.readFile(path.join(process.cwd(), reportPath), "utf8");

      expect(reportPath).toBe(".visualize/reports/context.md");
      expect(report).toContain("Visual Context Report");
      expect(report).toContain("## Summary");
      expect(report).toContain(".visualize/latest/screenshots/home.mobile.png");
      expect(report).toContain("## Failed Captures");
      expect(report).toContain("Connection refused");
      expect(report).toContain("VISUALIZE.md");
      expect(report).toContain("visualize capture");
    });
  });

  it("writes a report with watch instructions when watch is enabled", async () => {
    await withTempProject(async () => {
      const reportPath = await writeReport({
        manifest,
        outputDir: ".visualize",
        config: {
          ...defaultConfig,
          watch: {
            enabled: true,
            include: [],
            exclude: []
          }
        }
      });

      const report = await fs.readFile(path.join(process.cwd(), reportPath), "utf8");

      expect(report).toContain("Visual Context Report");
      expect(report).toContain("## Summary");
      expect(report).toContain(".visualize/latest/screenshots/home.mobile.png");
      expect(report).toContain("Connection refused");
      expect(report).toContain("VISUALIZE.md");
      expect(report).toContain("visualize watch");
      expect(report).not.toContain("refresh this visual context manually");
      expect(report).not.toContain("visualize capture");
    });
  });
});
