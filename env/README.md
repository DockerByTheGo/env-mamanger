# Env Manager

Typed environment variable reader/builder with defaults, optional values, strategies, and Zod validation.

## Install

`bun add env`

## Usage

```ts
import { EnvManager } from './src/EnvManager';
import { EnvManagerBuilder } from './src/EnvManagerBuilder';
```

- Define a schema with strategies that read raw values, optional Zod validation, defaults, and optional flags.
- Call `get(name)` for one value or `getAll()` for the typed environment object.
- Until a top-level `index.ts` is added, import from source paths inside the package rather than from the bare package name.

## Public Surface

- Package name: `env`
- Module kind: `module`
- Entry point: `index.ts`

Runtime dependencies: `zod`.
Peer dependencies: `typescript`.

## Scripts

- `bun run lint`: `bun --bun eslint .`
- `bun run node:test`: `bun x --bun vitest run --config vitest.config.ts`
- `bun run bun:test`: `bun test`
- `bun run coverage`: `bun x vitest --coverage`

## Notes

- `package.json` points `module` at `index.ts`, but no top-level `index.ts` currently exists; add one before publishing or importing by package name.
- Coverage output exists in the package directory; keep generated coverage out of source reviews.
