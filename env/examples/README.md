# Examples

These examples are ordered from the simplest usage to more advanced, production-style setups.

## Files

1. `01-basic-env-manager.ts`
   Direct `EnvManager.new()` usage with a single schema.
2. `02-process-defaults.ts`
   Reading from `process.env` with safe defaults.
3. `03-optional-and-enums.ts`
   Optional variables and enum validation.
4. `04-type-coercion.ts`
   Parsing numbers and booleans with Zod coercion.
5. `05-custom-strategies.ts`
   Loading values from a custom source instead of `process.env`.
6. `06-transform-lists-and-json.ts`
   Transforming comma-separated strings and JSON into structured values.
7. `07-production-config.ts`
   A more complete configuration setup with nested validation and `getAll()`.

## Run

From the `env` folder:

```bash
bun examples/01-basic-env-manager.ts
```

Replace the file name with any example you want to run.
