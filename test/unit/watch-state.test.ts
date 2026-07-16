import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import {
  activateWatch,
  deactivateWatch,
  getActiveWatchPid
} from "../../src/watch/watch-state.js";
import { withTempProject } from "../helpers/temp-project.js";

describe("watch state", () => {
  it("tracks and clears the current watcher", async () => {
    await withTempProject(async () => {
      await activateWatch(".visualize");

      expect(await getActiveWatchPid(".visualize")).toBe(process.pid);

      await deactivateWatch(".visualize");
      expect(await getActiveWatchPid(".visualize")).toBeUndefined();
    });
  });

  it("removes stale watcher state", async () => {
    await withTempProject(async () => {
      const statePath = path.join(".visualize", "watch-state.json");
      await fs.outputJson(statePath, {
        pid: 2147483647,
        startedAt: "2026-07-01T12:00:00.000Z"
      });

      expect(await getActiveWatchPid(".visualize")).toBeUndefined();
      expect(await fs.pathExists(statePath)).toBe(false);
    });
  });

  it("removes invalid watcher state without checking its PID", async () => {
    await withTempProject(async () => {
      const statePath = path.join(".visualize", "watch-state.json");
      await fs.outputJson(statePath, {
        pid: -1,
        startedAt: "invalid"
      });

      expect(await getActiveWatchPid(".visualize")).toBeUndefined();
      expect(await fs.pathExists(statePath)).toBe(false);
    });
  });
});
