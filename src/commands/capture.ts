import type { Command } from "commander";
import { runCapture } from "../core/run-capture.js";

export function registerCaptureCommand(program: Command): void {
  program
    .command("capture")
    .description("Load the visualize config and prepare a capture run.")
    .action(async () => {
      await runCapture({ reason: "manual" });
    });
}
