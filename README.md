# Visualize CLI

`visualize` gives AI coding assistants reliable visual context for local web applications. It renders configured routes in a real browser and creates screenshots, browser diagnostics, and a Markdown report that an AI can inspect while working on frontend code.

AI assistants can read source code, but they do not automatically know what the rendered application looks like. Layout problems, responsive behavior, browser errors, and incorrect routes can therefore remain invisible. Visualize closes that gap with local, repeatable browser captures stored inside the project.

## Install

Install Visualize and Playwright from the public pnpm registry:

```bash
pnpm add -D @simonscm/visualize playwright
pnpm exec playwright install chromium
pnpm exec visualize init
```

Playwright caches Chromium per user, so the browser download may already exist.

`visualize init` creates:

```txt
visualize.config.yml
VISUALIZE.md
```

An existing `visualize.config.yml` is not overwritten. Visualize only synchronizes its marked workflow section inside `VISUALIZE.md`; other project instructions are preserved.

## Configure Routes

Add the routes and viewports that the AI should be able to inspect inside of visualize.config.yml:

```yaml
baseUrl: http://localhost:5173

routes:
  - name: home
    path: /
  - name: login
    path: /login

viewports:
  - name: mobile
    width: 390
    height: 844
  - name: desktop
    width: 1440
    height: 900
```

Start the local application at the configured `baseUrl`. Then tell your AI coding assistant to use Visualize while implementing or verifying frontend changes, for example:

```txt
Use Visualize to inspect the configured routes and verify frontend changes.
```

The AI can follow `VISUALIZE.md`, run the appropriate command, and inspect the generated report and screenshots.

## Capture Modes

### Manual capture

```bash
pnpm exec visualize capture
```

Captures every configured route and viewport once, writes the results, and exits. Use this for occasional checks or when captures should only run on request or should be run by your agent manually after changes were made.

Failed routes are recorded without stopping the remaining captures. Rendered HTTP error pages such as `404` are captured because they can provide useful visual debugging context.

### Watch mode

```bash
pnpm exec visualize watch
```

Keeps running and creates new captures after relevant file changes. Run it in a second terminal or let the AI coding assistant manage it as a background process. Press `Ctrl+C` to stop.

While Watch is running, `VISUALIZE.md` indicates that visual context is updated automatically. After Watch stops, it returns to the manual capture workflow. Interrupted processes are detected and cleaned up by the next Visualize command.

## Output Files

```txt
.visualize/
  latest/screenshots/   # latest route and viewport captures
  reports/context.md    # AI-readable visual context report
  manifest.json         # capture status and browser diagnostics
  watch-state.json      # only present while Watch is running
```

Screenshot filenames are normalized from the route and viewport names. The manifest records URLs, viewport dimensions, HTTP status, page title, console and page errors, duration, and capture status.

## License

Licensed under the [MIT License](LICENSE).
