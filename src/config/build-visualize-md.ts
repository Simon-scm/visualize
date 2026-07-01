import type { VisualizeConfig } from "./schema.js";

export function buildVisualizeMd(config: VisualizeConfig): string {
  return [
    "# Visualize",
    "",
    "This project uses `visualize` to provide rendered UI context for AI-assisted frontend development.",
    "",
    "## Visual context",
    "",
    "Current visual context is generated at:",
    "",
    "`.visualize/reports/context.md`",
    "",
    "Screenshots are stored in:",
    "",
    "`.visualize/latest/screenshots/`",
    "",
    "AI coding assistants should use these files as the current rendered visual reference for frontend, layout, styling, and UI component work.",
    "",
    "## Updating visual context",
    "",
    buildWatchModeInstructions(config),
    "",
    "## Notes",
    "",
    "Use the report and screenshots to preserve behavior across configured routes and viewports.",
    ""
  ].join("\n");
}

function buildWatchModeInstructions(config: VisualizeConfig): string {
  if (config.watch.enabled) {
    return [
      "Watch mode is enabled.",
      "",
      "Visual context is expected to be updated automatically by:",
      "",
      "`visualize watch`",
      "",
      "Do not rely on stale screenshots. Check `.visualize/reports/context.md` for the latest generated timestamp."
    ].join("\n");
  }

  return [
    "Watch mode is currently disabled.",
    "",
    "After changing HTML, CSS, frontend components, routes, or UI assets, refresh the visual context manually with:",
    "",
    "`visualize capture`"
  ].join("\n");
}
