# Env Manager Onboarding

This file is for contributors changing `env`. The README is for library consumers; keep implementation notes and project conventions here.

## Project Structure

- `src/EnvManager.ts` contains read/get/getAll behavior.
- `src/EnvManagerBuilder.ts` contains schema builder types and helpers.
- `examples` contains seven focused usage examples.
- `tests` includes runtime and type tests.

## Local Workflow

1. Install workspace dependencies from `project` with `bun install` unless this module has its own lockfile and you intentionally need isolated installs.
2. Make focused changes inside this module and its direct shared dependencies.
3. Run the narrowest relevant script before broad workspace checks.

## Scripts

- `bun run lint`: `bun --bun eslint .`
- `bun run node:test`: `bun x --bun vitest run --config vitest.config.ts`
- `bun run bun:test`: `bun test`
- `bun run coverage`: `bun x vitest --coverage`

## Design Choices

- Define a schema with strategies that read raw values, optional Zod validation, defaults, and optional flags.
- Call `get(name)` for one value or `getAll()` for the typed environment object.

## Things To Know

- `package.json` points `module` at `index.ts`, but no top-level `index.ts` currently exists; add one before publishing or importing by package name.
- Coverage output exists in the package directory; keep generated coverage out of source reviews.

## Contribution Rules

- Keep public exports routed through the package entry point.
- Prefer existing Result/Option/service contracts from workspace packages over introducing parallel abstractions.
- Add tests beside the behavior you change when the module already has a `tests` directory.
- Do not commit secrets, generated coverage, or live-service credentials.
