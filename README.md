# Visualize CLI

`visualize` is a local-first CLI that captures rendered browser context for local web applications.

It is built for AI-assisted frontend development. Coding agents can read source files, but they usually do not know what the app actually looks like in a browser. `visualize` creates screenshots, browser diagnostics, and an AI-readable Markdown report so the rendered UI can become part of the project context.

## Features

- initialize a project with `visualize.config.yml`
- create persistent AI instructions in `VISUALIZE.md`
- capture configured routes in headless Chromium with Playwright
- render every configured route across every configured viewport
- save screenshots in `.visualize/latest/screenshots/`
- write structured diagnostics to `.visualize/manifest.json`
- write an AI-readable report to `.visualize/reports/context.md`
- watch UI-relevant files and refresh visual context after changes
- validate configuration with Zod
- run typecheck, tests, and build through one check command

## Requirements

- Node.js 18 or newer
- pnpm
- a local web app running at the configured `baseUrl`
- Playwright Chromium browser binary

Install the CLI in your project:

```bash
pnpm add -D visualize
```

Install the Chromium binary used by Playwright:

```bash
pnpm exec playwright install chromium
```

If Chromium is missing, `visualize capture` will print this setup command.

With a project-local installation, run the CLI through `pnpm exec`:

```bash
pnpm exec visualize --help
```

## Quick Start

Initialize `visualize` in a project:

```bash
pnpm exec visualize init
```

Start your local web app, for example at:

```txt
http://localhost:5173
```

Capture visual context:

```bash
pnpm exec visualize capture
```

Review the generated files:

```txt
.visualize/
  latest/
    screenshots/
  reports/
    context.md
  manifest.json
VISUALIZE.md
visualize.config.yml
```

During frontend work, use watch mode:

```bash
pnpm exec visualize watch
```

Watch mode does not run an initial capture. Run `pnpm exec visualize capture` once first if you need a fresh baseline before editing.

## Global Installation

The recommended setup is project-local installation so every project can pin its own `visualize` version.

If you prefer a global command, install it globally:

```bash
pnpm add -g visualize
```

Then you can run:

```bash
visualize init
visualize capture
visualize watch
```

## Commands

### `visualize init`

Creates:

- `visualize.config.yml`
- `VISUALIZE.md`

Existing files are not overwritten.

```bash
pnpm exec visualize init
```

### `visualize capture`

Loads `visualize.config.yml`, opens each configured route in Chromium, captures every configured viewport, and writes screenshots, manifest, and report files.

```bash
pnpm exec visualize capture
```

Output:

- `.visualize/latest/screenshots/*.png`
- `.visualize/manifest.json`
- `.visualize/reports/context.md`

Capture failures do not stop the whole run. Failed captures are recorded in the manifest and report with an error message.

HTTP responses such as `404` are still captured as rendered pages. They are not automatically treated as capture failures, because the screenshot may be useful context for AI-assisted debugging.

### `visualize watch`

Watches files from `watch.include`, ignores files from `watch.exclude`, and reruns the same capture pipeline after relevant file changes.

```bash
pnpm exec visualize watch
```

Behavior:

- no initial capture on startup
- 1000 ms debounce for quick file changes
- no parallel captures
- `.visualize/**` ignored by default
- if `watch.enabled` is `false`, a warning is printed but watch mode still starts for the current session

## Configuration

Default `visualize.config.yml`:

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

outputDir: .visualize

watch:
  enabled: false
  include:
    - "src/**/*.{html,css,scss,js,jsx,ts,tsx}"
    - "public/**/*"
  exclude:
    - "node_modules/**"
    - ".visualize/**"

stabilize:
  waitUntil: networkidle
  disableAnimations: true
  waitMs: 300
  timeoutMs: 30000
```

Set `baseUrl` to the URL where your app is running locally.

Add routes manually:

```yaml
routes:
  - name: home
    path: /
  - name: settings
    path: /settings
```

Add viewports manually:

```yaml
viewports:
  - name: mobile
    width: 390
    height: 844
  - name: tablet
    width: 768
    height: 1024
```

`stabilize.timeoutMs` controls the Playwright navigation timeout for each route capture. If a route does not load within this time, the capture is marked as `failed` in the manifest and report, and the remaining captures continue.

## Output Files

### Screenshots

Screenshots are stored in:

```txt
.visualize/latest/screenshots/
```

Example:

```txt
.visualize/latest/screenshots/home.mobile.png
.visualize/latest/screenshots/home.desktop.png
```

Screenshot filenames are generated from `route.name` and `viewport.name`. These names are normalized to lowercase URL-safe file segments, so a route named `Login / Sign Up` with viewport `Mobile XL` becomes:

```txt
.visualize/latest/screenshots/login-sign-up.mobile-xl.png
```

### Manifest

`.visualize/manifest.json` contains structured capture data:

- route name and path
- viewport name and dimensions
- screenshot path
- status: `ok` or `failed`
- requested URL
- final URL after redirects
- page title
- HTTP status
- console error count
- page error count
- capture duration
- error message for failed captures

### AI Context Report

`.visualize/reports/context.md` summarizes the current visual context:

- total captures
- successful and failed captures
- screenshot references
- browser diagnostics
- failed capture errors
- project instructions for AI coding assistants

### `VISUALIZE.md`

`VISUALIZE.md` is a persistent project-level instruction file for AI coding assistants.

Its wording depends on `watch.enabled`:

- `watch.enabled: false` tells the user or AI assistant to run `visualize capture` after UI changes
- `watch.enabled: true` says visual context is expected to be updated by `visualize watch`

## Development

Clone this repository and install dependencies:

```bash
pnpm install
pnpm exec playwright install chromium
```

During local development, use `pnpm dev -- ...` to run the TypeScript source directly:

Scripts:

```bash
pnpm dev -- init
pnpm dev -- capture
pnpm dev -- watch
pnpm typecheck
pnpm test
pnpm test:watch
pnpm check
pnpm build
pnpm start -- init
```

`pnpm check` runs:

```bash
pnpm typecheck && pnpm test && pnpm build
```

## Current Limitations

- routes must be configured manually
- authentication and login flows are not supported yet
- all routes and viewports are recaptured after watched changes
- no visual diffing or baselines yet
- no DOM extraction or CSS metadata extraction yet
- no MCP server or AI API integration

## Roadmap

- automatic endpoint detection
- auth simulation
- dynamic recaptures based on changed files / affected routes
- more rendered metadata

## License

MIT. This project is open source and may be used, modified, and distributed under the terms of the MIT License.
