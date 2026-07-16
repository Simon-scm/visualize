#!/usr/bin/env node

import { Command } from "commander";
import { registerCaptureCommand } from "./commands/capture.js";
import { registerInitCommand } from "./commands/init.js";
import { registerWatchCommand } from "./commands/watch.js";
import { getPackageVersion } from "./version.js";

const program = new Command();

program
  .name("visualize")
  .description("Generate visual context for local web applications.")
  .version(getPackageVersion());

registerInitCommand(program);
registerCaptureCommand(program);
registerWatchCommand(program);

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("An unknown error occurred.");
  }

  process.exit(1);
});
