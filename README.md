# Visualize CLI

`visualize` is a local-first CLI for generating visual context from local web applications.

## Current Scope

The current MVP supports config initialization, screenshot capture, AI-readable reports, and a simple watch mode.

```bash
pnpm install
pnpm dev -- init
pnpm dev -- capture
pnpm dev -- watch
```

`init` creates `visualize.config.yml` and `VISUALIZE.md` in the current working directory. Running it again leaves existing files untouched.

## Scripts

```bash
pnpm dev -- init
pnpm dev -- capture
pnpm dev -- watch
pnpm typecheck
pnpm test
pnpm check
pnpm build
pnpm start -- init
```

## TODO

- automatic endpoint detection
- auth simulation
- dynamic recaptures based on changed files / affected routes
- more rendered metadata
