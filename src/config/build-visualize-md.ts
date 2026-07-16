export type VisualizeWorkflow = "manual" | "watch";

export const WORKFLOW_START_MARKER = "<!-- visualize:workflow:start -->";
export const WORKFLOW_END_MARKER = "<!-- visualize:workflow:end -->";

export function buildVisualizeMd(
  workflow: VisualizeWorkflow = "manual"
): string {
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
    buildManagedWorkflowBlock(workflow),
    "",
    "## Notes",
    "",
    "Use the report and screenshots to preserve behavior across configured routes and viewports.",
    ""
  ].join("\n");
}

export function buildManagedWorkflowBlock(
  workflow: VisualizeWorkflow
): string {
  return [
    WORKFLOW_START_MARKER,
    buildWorkflowInstructions(workflow),
    WORKFLOW_END_MARKER
  ].join("\n");
}

function buildWorkflowInstructions(workflow: VisualizeWorkflow): string {
  if (workflow === "watch") {
    return [
      "Watch mode is currently running through `visualize watch`.",
      "",
      "Visual context is refreshed automatically after relevant file changes. Check `.visualize/reports/context.md` for the latest generated timestamp."
    ].join("\n");
  }

  return [
    "Manual capture is currently active.",
    "",
    "After changing HTML, CSS, frontend components, routes, or UI assets, refresh the visual context manually with:",
    "",
    "`visualize capture`"
  ].join("\n");
}
