import type { Command } from "commander";
import chokidar from "chokidar";
import path from "node:path";
import picomatch from "picomatch";
import { loadConfig } from "../config/load-config.js";
import { runCapture } from "../core/run-capture.js";
import { logger } from "../utils/logger.js";

const DEBOUNCE_MS = 1000;

export function registerWatchCommand(program: Command): void {
  program
    .command("watch")
    .description("Watch UI-relevant files and capture visual context on changes.")
    .action(async () => {
      const config = await loadConfig();

      if (!config.watch.enabled) {
        logger.info("Warning: watch.enabled is false in visualize.config.yml.");
        logger.info("Starting watch mode anyway for this session.");
        logger.info("");
      }

      logger.info("Starting visualize watch...");
      logger.info("");
      logger.info("Watching:");
      for (const includePattern of config.watch.include) {
        logger.info(`  ${includePattern}`);
      }
      logger.info("");
      logger.info("Ignoring:");
      for (const excludePattern of config.watch.exclude) {
        logger.info(`  ${excludePattern}`);
      }
      logger.info("");
      logger.info("Press Ctrl+C to stop.");

      let debounceTimer: NodeJS.Timeout | undefined;
      let isCapturing = false;
      let pendingCapture = false;
      const changedFiles = new Set<string>();
      const isIncluded = picomatch(config.watch.include);
      const isExcluded = picomatch(config.watch.exclude);
      const watchRoots = getWatchRoots(config.watch.include);

      const runQueuedCapture = async (): Promise<void> => {
        debounceTimer = undefined;

        if (isCapturing) {
          pendingCapture = true;
          return;
        }

        const filesForCapture = Array.from(changedFiles).sort();
        changedFiles.clear();
        pendingCapture = false;
        isCapturing = true;

        try {
          await runCapture({
            reason: "watch",
            changedFiles: filesForCapture
          });
        } catch (error) {
          logger.error(
            error instanceof Error ? error.message : "Watch capture failed."
          );
        } finally {
          isCapturing = false;

          if (pendingCapture || changedFiles.size > 0) {
            scheduleCapture(0);
          }
        }
      };

      const scheduleCapture = (delayMs = DEBOUNCE_MS): void => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          void runQueuedCapture();
        }, delayMs);
      };

      const watcher = chokidar.watch(watchRoots, {
        ignored: (ignoredPath) => isExcluded(normalizeChangedPath(ignoredPath)),
        ignoreInitial: true,
        persistent: true
      });

      watcher.on("all", (_eventName, changedPath) => {
        const normalizedPath = normalizeChangedPath(changedPath);
        if (!isIncluded(normalizedPath) || isExcluded(normalizedPath)) {
          return;
        }

        logger.info(`file changed: ${normalizedPath}`);
        changedFiles.add(normalizedPath);
        scheduleCapture();
      });

      watcher.on("error", (error) => {
        logger.error(error instanceof Error ? error.message : String(error));
      });

      process.once("SIGINT", () => {
        void watcher.close().finally(() => {
          process.exit(0);
        });
      });

      await new Promise<void>(() => undefined);
    });
}

function normalizeChangedPath(changedPath: string): string {
  const relativePath = path.isAbsolute(changedPath)
    ? path.relative(process.cwd(), changedPath)
    : changedPath;

  return relativePath.replaceAll(path.sep, "/");
}

function getWatchRoots(includePatterns: string[]): string[] {
  const roots = new Set<string>();

  for (const pattern of includePatterns) {
    const normalizedPattern = pattern.replaceAll("\\", "/");
    const segments = normalizedPattern.split("/");
    const firstGlobSegmentIndex = segments.findIndex(containsGlobToken);
    const rootSegments =
      firstGlobSegmentIndex === -1
        ? segments
        : segments.slice(0, firstGlobSegmentIndex);
    const root = rootSegments.join("/") || ".";

    roots.add(root);
  }

  return Array.from(roots);
}

function containsGlobToken(segment: string): boolean {
  return /[*?[{]/.test(segment);
}
