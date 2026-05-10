# env

Type-safe environment variable management for Bun/TypeScript projects using Zod validation.

This package provides two main ways to work with configuration:

- `EnvManager`
  Best when you want to define the full schema directly.
- `EnvManagerBuilder`
  Best when you want a fluent API for building config from `process.env` or custom sources.

## Features

- Type-safe access to environment variables
- Zod-based validation and parsing
- Support for defaults
- Support for optional variables
- Support for custom value-loading strategies
- Support for transformed values such as arrays, booleans, numbers, and parsed JSON

## Installation

```bash
bun install
```

## Quick Start

### Direct `EnvManager` usage

```ts
import z from "zod";
import { EnvManager } from "./src/EnvManager.ts";

const envManager = EnvManager.new({
  PORT: {
    name: "PORT",
    strategy: () => "3000",
    schema: z.coerce.number().int().positive(),
  },
  NODE_ENV: {
    name: "NODE_ENV",
    strategy: () => "development",
    schema: z.enum(["development", "test", "production"]),
  },
});

const port = envManager.get("PORT");
const nodeEnv = envManager.get("NODE_ENV");
```

### Builder-based usage

```ts
import z from "zod";
import { EnvManagerBuilder } from "./src/EnvManagerBuilder.ts";

const manager = EnvManagerBuilder.empty()
  .fromProcess({
    name: "PORT",
    schema: z.coerce.number().int().positive(),
    defaultValue: 3000,
  })
  .fromProcess({
    name: "NODE_ENV",
    schema: z.enum(["development", "test", "production"]),
    defaultValue: "development",
  })
  .buildManager();

console.log(manager.get("PORT"));
console.log(manager.get("NODE_ENV"));
```

## Core Concepts

### 1. Strategy

Every environment entry defines a `strategy`, which is responsible for loading the raw value.

Example:

```ts
strategy: name => process.env[name]
```

This makes the package flexible enough to read config from:

- `process.env`
- config files
- secret stores
- in-memory objects
- test doubles

### 2. Schema

Each value can be validated or transformed with Zod.

Examples:

```ts
z.string()
z.coerce.number()
z.coerce.boolean()
z.enum(["development", "production"])
z.string().transform(value => value.split(","))
```

### 3. Default Values

If a strategy returns `undefined`, `defaultValue` is used when provided.

```ts
.fromProcess({
  name: "PORT",
  schema: z.coerce.number(),
  defaultValue: 3000,
})
```

### 4. Optional Variables

If a value is not required, set `isOptional: true`.

```ts
.fromProcess({
  name: "API_KEY",
  schema: z.string(),
  isOptional: true,
})
```

## API Overview

### `EnvManager.new(schema)`

Creates a new environment manager from a plain schema object.

### `manager.get(name)`

Loads, validates, and returns a single environment variable.

Behavior:

- Returns parsed value when present
- Returns `defaultValue` when missing and configured
- Returns `undefined` when optional and missing
- Throws when required and missing
- Throws when schema validation fails

### `manager.getAll()`

Resolves all configured values and returns them as one object.

### `EnvManagerBuilder.empty()`

Starts a new fluent builder.

### `builder.fromProcess(config)`

Adds an entry that reads from `process.env`.

### `builder.add(config)`

Adds an entry with a fully custom strategy.

### `builder.raw()`

Returns the built schema object without constructing an `EnvManager`.

### `builder.buildManager()`

Builds and returns an `EnvManager`.

## Common Patterns

### Number coercion

```ts
schema: z.coerce.number().int().positive()
```

### Boolean coercion

```ts
schema: z.coerce.boolean()
```

### Enum validation

```ts
schema: z.enum(["development", "test", "production"])
```

### Comma-separated lists

```ts
schema: z.string().transform(value =>
  value.split(",").map(item => item.trim()).filter(Boolean),
)
```

### JSON config

```ts
schema: z.string()
  .transform(value => JSON.parse(value))
  .pipe(z.object({
    host: z.string(),
    port: z.number(),
  }))
```

## Examples

The project includes a dedicated examples folder ordered from basic to advanced:

1. [examples/01-basic-env-manager.ts](./examples/01-basic-env-manager.ts)
2. [examples/02-process-defaults.ts](./examples/02-process-defaults.ts)
3. [examples/03-optional-and-enums.ts](./examples/03-optional-and-enums.ts)
4. [examples/04-type-coercion.ts](./examples/04-type-coercion.ts)
5. [examples/05-custom-strategies.ts](./examples/05-custom-strategies.ts)
6. [examples/06-transform-lists-and-json.ts](./examples/06-transform-lists-and-json.ts)
7. [examples/07-production-config.ts](./examples/07-production-config.ts)

You can also start from [examples/README.md](./examples/README.md).

Run any example with:

```bash
bun examples/01-basic-env-manager.ts
```

## Scripts

```bash
bun run test
bun run coverage
bun run lint
```

## Project Structure

```text
env/
├── examples/               Example usage from simple to advanced
├── src/
│   ├── Env.ts              Core env config type
│   ├── EnvManager.ts       Runtime manager for resolving values
│   ├── EnvManagerBuilder.ts Fluent builder API
│   └── index.ts            Local usage playground
├── tests/                  Runtime and type tests
├── package.json
└── README.md
```

## Error Behavior

The manager throws in two main cases:

- A required environment variable is missing and no default value is provided
- A value fails Zod validation

This makes failures explicit and early, which is useful during startup and deployment.

## Testing

The project includes:

- runtime tests for loading and validation behavior
- type tests for inference correctness

Run the full test suite with:

```bash
bun run test
```
