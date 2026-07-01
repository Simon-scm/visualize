# Visualize CLI - Eyes for your AI Agents 

`visualize` is a local-first CLI for generating browser-rendered visual context from local web applications.

It is designed for AI-assisted frontend development: AI coding assistants can read your source code, but they usually do not know what your app actually looks like in the browser. Visualize closes that gap by capturing screenshots, browser diagnostics, and an AI-readable context report for your web app.

## Why?

AI-assisted frontend development often breaks down when changes become visual.

Typical problems:

The AI can edit HTML, CSS, JSX, or TSX, but cannot reliably see the rendered result.
Developers manually open the browser, inspect layouts, take screenshots, and describe visual issues back to the AI.
Mobile and desktop regressions are easy to miss.
Visual feedback is not stored as persistent project context.
Existing visual testing tools are often focused on CI, QA, or design review, not local AI-coding workflows.

Visualize creates a .visualize folder with screenshots, diagnostics, and a Markdown report that can be used as visual context for AI coding assistants.

## What It Does

Visualize can currently:

- initialize a project with visualize.config.yml
- create persistent AI instructions in VISUALIZE.md
- capture configured routes in a real browser using Playwright
- render each route across configured viewports
- save screenshots to .visualize/latest/screenshots/
- write browser diagnostics to .visualize/manifest.json
- generate an AI-readable report at .visualize/reports/context.md
- watch UI-related files and automatically refresh visual context after changes
- validate configuration with Zod

## Install

This project uses `pnpm`.

```bash
pnpm install
```

Playwright browser binaries are required for screenshot capture:

```bash
pnpm exec playwright install chromium
```

## Quick Start

Initialize a project:

```bash
pnpm dev -- init
```

Start your local web app, for example on `http://localhost:5173`, then capture visual context:

```bash
pnpm dev -- capture
```

This creates:

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

Use watch mode during frontend work:

```bash
pnpm dev -- watch
```

Watch mode does not run an initial capture. Run `visualize capture` once first if you need a fresh baseline before editing files.

## Commands

### `visualize init`

Creates:

- `visualize.config.yml`
- `VISUALIZE.md`

Existing files are not overwritten.

```bash
pnpm dev -- init
```

### `visualize capture`

Loads `visualize.config.yml`, launches Chromium, captures all configured route and viewport combinations, and writes:

- `.visualize/latest/screenshots/*.png`
- `.visualize/manifest.json`
- `.visualize/reports/context.md`

```bash
pnpm dev -- capture
```

Capture failures do not stop the whole run. Failed captures are recorded in the manifest and report with an error message.

### `visualize watch`

Watches files from `watch.include`, ignores files from `watch.exclude`, and reruns the existing capture pipeline after relevant changes.

```bash
pnpm dev -- watch
```

Multiple quick file changes are debounced into one capture. Captures are not run in parallel.

If `watch.enabled` is `false`, the command prints a warning but still starts for the current session.

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
```

Set `baseUrl` to the URL of your running local app.

Add or remove routes manually:

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

## Output Files

### Screenshots

Screenshots are stored at:

```txt
.visualize/latest/screenshots/
```

Example:

```txt
.visualize/latest/screenshots/home.mobile.png
.visualize/latest/screenshots/home.desktop.png
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

`.visualize/reports/context.md` summarizes the current visual context for AI coding assistants.

It includes:

- capture summary
- screenshot references
- browser diagnostics
- failed captures
- project instructions

### `VISUALIZE.md`

`VISUALIZE.md` is a persistent project-level instruction file. It tells AI coding assistants where to find the latest report and screenshots.

## Development

## Scripts

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

## TODO

- automatic endpoint detection
- auth simulation
- dynamic recaptures based on changed files / affected routes
