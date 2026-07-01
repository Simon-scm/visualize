import path from "node:path";
import fs from "fs-extra";
import type { VisualizeConfig } from "../config/schema.js";
import type { ManifestCapture, VisualizeManifest } from "./manifest.js";

export async function writeReport(params: {
  manifest: VisualizeManifest;
  outputDir: string;
  config: VisualizeConfig;
}): Promise<string> {
  const reportPath = toReportPath(params.outputDir);
  await fs.outputFile(
    path.join(params.outputDir, "reports", "context.md"),
    formatReport(params.manifest, params.config)
  );

  return reportPath;
}

function formatReport(
  manifest: VisualizeManifest,
  config: VisualizeConfig
): string {
  const totalCaptures = manifest.captures.length;
  const successfulCaptures = manifest.captures.filter(
    (capture) => capture.status === "ok"
  ).length;
  const failedCaptures = manifest.captures.filter(
    (capture) => capture.status === "failed"
  ).length;
  const capturesWithConsoleErrors = manifest.captures.filter(
    (capture) => capture.consoleErrorCount > 0
  ).length;
  const capturesWithPageErrors = manifest.captures.filter(
    (capture) => capture.pageErrorCount > 0
  ).length;

  return [
    "# Visual Context Report",
    "",
    `Generated at: ${manifest.generatedAt}`,
    "",
    `Base URL: ${manifest.baseUrl}`,
    "",
    "## Summary",
    "",
    `- Total captures: ${totalCaptures}`,
    `- Successful captures: ${successfulCaptures}`,
    `- Failed captures: ${failedCaptures}`,
    `- Captures with console errors: ${capturesWithConsoleErrors}`,
    `- Captures with page errors: ${capturesWithPageErrors}`,
    "",
    "## Visual References",
    "",
    formatVisualReferences(manifest.captures),
    "",
    "## Failed Captures",
    "",
    formatFailedCaptures(manifest.captures),
    "",
    "## Notes for AI Coding Assistants",
    "",
    "Use the screenshot paths above as the current visual reference for the rendered web app.",
    "",
    "When changing layout, styling, or UI components, preserve behavior across all listed viewports.",
    "",
    "## Project Instructions",
    "",
    "For persistent AI coding instructions, see:",
    "",
    "`VISUALIZE.md`",
    "",
    buildWatchModeReportText(config),
    ""
  ].join("\n");
}

function formatVisualReferences(captures: ManifestCapture[]): string {
  if (captures.length === 0) {
    return "None.";
  }

  return captures.map(formatCaptureReference).join("\n\n");
}

function formatCaptureReference(capture: ManifestCapture): string {
  return [
    `### ${capture.routeName} - ${capture.viewport}`,
    "",
    `- Route: \`${capture.path}\``,
    `- Requested URL: \`${capture.requestedUrl}\``,
    `- Final URL: ${formatInlineCode(capture.finalUrl)}`,
    `- Viewport: \`${capture.width}x${capture.height}\``,
    `- HTTP status: ${formatInlineCode(capture.httpStatus)}`,
    `- Page title: ${formatInlineCode(capture.title)}`,
    `- Status: \`${capture.status}\``,
    `- Console errors: \`${capture.consoleErrorCount}\``,
    `- Page errors: \`${capture.pageErrorCount}\``,
    `- Duration: \`${capture.durationMs}ms\``,
    `- Screenshot: \`${capture.screenshot}\``
  ].join("\n");
}

function formatFailedCaptures(captures: ManifestCapture[]): string {
  const failedCaptures = captures.filter((capture) => capture.status === "failed");

  if (failedCaptures.length === 0) {
    return "None.";
  }

  return failedCaptures
    .map((capture) =>
      [
        `### ${capture.routeName} - ${capture.viewport}`,
        "",
        `- Requested URL: \`${capture.requestedUrl}\``,
        `- Final URL: ${formatInlineCode(capture.finalUrl)}`,
        `- Viewport: \`${capture.width}x${capture.height}\``,
        `- Duration: \`${capture.durationMs}ms\``,
        `- Error: ${formatInlineCode(capture.error)}`
      ].join("\n")
    )
    .join("\n\n");
}

function formatInlineCode(value: string | number | undefined): string {
  if (value === undefined || value === "") {
    return "`n/a`";
  }

  return `\`${sanitizeInlineValue(value)}\``;
}

function sanitizeInlineValue(value: string | number): string {
  return String(value)
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replaceAll("`", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function buildWatchModeReportText(config: VisualizeConfig): string {
  if (config.watch.enabled) {
    return [
      "Watch mode is enabled. Visual context is expected to be updated automatically by:",
      "",
      "`visualize watch`"
    ].join("\n");
  }

  return [
    "Watch mode is currently disabled. After UI-related changes, refresh this visual context manually with:",
    "",
    "`visualize capture`"
  ].join("\n");
}

function toReportPath(outputDir: string): string {
  return [outputDir, "reports", "context.md"].join("/");
}
