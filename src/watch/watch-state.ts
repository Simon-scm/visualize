import path from "node:path";
import fs from "fs-extra";

type WatchState = {
  pid: number;
  startedAt: string;
};

const WATCH_STATE_FILE_NAME = "watch-state.json";

export async function activateWatch(outputDir: string): Promise<void> {
  const activePid = await getActiveWatchPid(outputDir);
  if (activePid !== undefined && activePid !== process.pid) {
    throw new Error(`Visualize watch is already running (PID ${activePid}).`);
  }

  const state: WatchState = {
    pid: process.pid,
    startedAt: new Date().toISOString()
  };

  await fs.outputJson(getWatchStatePath(outputDir), state, { spaces: 2 });
}

export async function deactivateWatch(outputDir: string): Promise<void> {
  const state = await readWatchState(outputDir);
  if (!state || state.pid === process.pid || !isProcessRunning(state.pid)) {
    await fs.remove(getWatchStatePath(outputDir));
  }
}

export async function getActiveWatchPid(
  outputDir: string
): Promise<number | undefined> {
  const state = await readWatchState(outputDir);
  if (!state) {
    return undefined;
  }

  if (isProcessRunning(state.pid)) {
    return state.pid;
  }

  await fs.remove(getWatchStatePath(outputDir));
  return undefined;
}

function getWatchStatePath(outputDir: string): string {
  return path.join(outputDir, WATCH_STATE_FILE_NAME);
}

async function readWatchState(outputDir: string): Promise<WatchState | undefined> {
  try {
    const value: unknown = await fs.readJson(getWatchStatePath(outputDir));
    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as WatchState).pid === "number" &&
      Number.isInteger((value as WatchState).pid) &&
      (value as WatchState).pid > 0 &&
      typeof (value as WatchState).startedAt === "string"
    ) {
      return value as WatchState;
    }

    await fs.remove(getWatchStatePath(outputDir));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      await fs.remove(getWatchStatePath(outputDir));
    }
  }

  return undefined;
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}
