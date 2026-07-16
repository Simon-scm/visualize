import path from "node:path";
import fs from "fs-extra";
import type { VisualizeWorkflow } from "../config/build-visualize-md.js";
import type { ManifestCapture, VisualizeManifest } from "./manifest.js";

export async function writeReport(params: {
  manifest: VisualizeManifest;
  outputDir: string;
  workflow: VisualizeWorkflow;
}): Promise<string> {
  const reportPath = toReportPath(params.outputDir);
  await fs.outputFile(
    path.join(params.outputDir, "reports", "context.md"),
    formatReport(params.manifest, params.workflow)
  );

  return reportPath;
}

function formatReport(
  manifest: VisualizeManifest,
  workflow: VisualizeWorkflow
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
    buildWorkflowReportText(workflow),
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

function buildWorkflowReportText(workflow: VisualizeWorkflow): string {
  if (workflow === "watch") {
    return [
      "Watch mode is running through `visualize watch`. Visual context is refreshed automatically after relevant file changes."
    ].join("\n");
  }

  return [
    "Manual capture is active. After UI-related changes, refresh this visual context with:",
    "",
    "`visualize capture`"
  ].join("\n");
}

function toReportPath(outputDir: string): string {
  return [outputDir, "reports", "context.md"].join("/");
}
