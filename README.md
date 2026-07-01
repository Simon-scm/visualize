# Visualize CLI

`visualize` is a local-first CLI for generating visual context from local web applications.

## Current Scope

Step 1 implements the CLI foundation and the `init` command.

```bash
pnpm install
pnpm dev -- init
```

This creates `visualize.config.yml` in the current working directory. Running the command again will leave the existing file untouched.

## Scripts

```bash
pnpm dev -- init
pnpm typecheck
pnpm build
pnpm start -- init
```

Future commands such as `capture`, `report`, and `watch` are intentionally not implemented yet.
