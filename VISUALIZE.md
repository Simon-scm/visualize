# Visualize

This project uses `visualize` to provide rendered UI context for AI-assisted frontend development.

## Visual context

Current visual context is generated at:

`.visualize/reports/context.md`

Screenshots are stored in:

`.visualize/latest/screenshots/`

AI coding assistants should use these files as the current rendered visual reference for frontend, layout, styling, and UI component work.

## Updating visual context

<!-- visualize:workflow:start -->
Manual capture is currently active.

After changing HTML, CSS, frontend components, routes, or UI assets, refresh the visual context manually with:

`visualize capture`
<!-- visualize:workflow:end -->

## Notes

Use the report and screenshots to preserve behavior across configured routes and viewports.
