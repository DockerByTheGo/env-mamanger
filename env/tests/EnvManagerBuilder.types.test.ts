import { describe, it, expectTypeOf } from "vitest";
import { z } from "zod/v3";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder";

describe("EnvManagerBuilder - Type Tests", () => {
  describe("raw() return types", () => {
    it("should infer string type by default", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          defaultValue: "3000",
        })
        .raw();

      expectTypeOf(env.PORT).toEqualTypeOf<string>();
    });

    it("should infer number type from coerce schema", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          schema: z.coerce.number(),
          defaultValue: 3000,
        })
        .raw();

      expectTypeOf(env.PORT).toEqualTypeOf<number>();
    });

    it("should infer boolean type from coerce schema", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "ENABLE_FEATURE",
          schema: z.coerce.boolean(),
          defaultValue: true,
        })
        .raw();

      expectTypeOf(env.ENABLE_FEATURE).toEqualTypeOf<boolean>();
    });

    it("should infer enum type from schema", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "NODE_ENV",
          schema: z.enum(["development", "production", "test"]),
          defaultValue: "development",
        })
        .raw();

      expectTypeOf(env.NODE_ENV).toEqualTypeOf<"development" | "production" | "test">();
    });

    it("should infer optional type when isOptional is true", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "API_KEY",
          isOptional: true,
        })
        .raw();

      expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
    });

    it("should infer required type when isOptional is false or omitted", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "API_KEY",
          defaultValue: "default-key",
        })
        .raw();

      expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
    });

    it("should infer multiple properties correctly", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          schema: z.coerce.number(),
          defaultValue: 3000,
        })
        .fromProcess({
          name: "NODE_ENV",
          schema: z.enum(["development", "production"]),
          defaultValue: "development",
        })
        .fromProcess({
          name: "API_KEY",
          isOptional: true,
        })
        .raw();

      expectTypeOf(env.PORT).toEqualTypeOf<number>();
      expectTypeOf(env.NODE_ENV).toEqualTypeOf<"development" | "production">();
      expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
    });

    it("should infer array type from transform", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "ALLOWED_HOSTS",
          schema: z.string().transform((str) => str.split(",")),
          defaultValue: "localhost",
        })
        .raw();

      expectTypeOf(env.ALLOWED_HOSTS).toEqualTypeOf<string[]>();
    });

    it("should infer object type from transform and pipe", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "CONFIG",
          schema: z.string().transform((str) => JSON.parse(str)).pipe(
            z.object({
              host: z.string(),
              port: z.number(),
            })
          ),
          defaultValue: '{"host":"localhost","port":3000}',
        })
        .raw();

      expectTypeOf(env.CONFIG).toEqualTypeOf<{ host: string; port: number }>();
    });

    it("should infer custom strategy type", () => {
      const env = EnvManagerBuilder.empty()
        .add({
          name: "CUSTOM",
          strategy: () => "value",
          schema: z.string(),
        })
        .raw();

      expectTypeOf(env.CUSTOM).toEqualTypeOf<string>();
    });

    it("should infer custom strategy with number type", () => {
      const env = EnvManagerBuilder.empty()
        .add({
          name: "CUSTOM_NUMBER",
          strategy: () => "42",
          schema: z.coerce.number(),
        })
        .raw();

      expectTypeOf(env.CUSTOM_NUMBER).toEqualTypeOf<number>();
    });

    it("should infer optional custom strategy", () => {
      const env = EnvManagerBuilder.empty()
        .add({
          name: "OPTIONAL_CUSTOM",
          strategy: () => undefined,
          isOptional: true,
        })
        .raw();

      expectTypeOf(env.OPTIONAL_CUSTOM).toEqualTypeOf<string | undefined>();
    });

    it("should preserve literal string types in property names", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "MY_VAR",
          defaultValue: "value",
        })
        .raw();

      expectTypeOf(env).toHaveProperty("MY_VAR");
    });

    it("should infer union types correctly", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "LOG_LEVEL",
          schema: z.union([
            z.literal("debug"),
            z.literal("info"),
            z.literal("warn"),
            z.literal("error"),
          ]),
          defaultValue: "info",
        })
        .raw();

      expectTypeOf(env.LOG_LEVEL).toEqualTypeOf<"debug" | "info" | "warn" | "error">();
    });

    it("should handle chained builders with correct types", () => {
      const builder = EnvManagerBuilder.empty()
        .fromProcess({
          name: "VAR1",
          defaultValue: "value1",
        });

      const env = builder
        .fromProcess({
          name: "VAR2",
          schema: z.coerce.number(),
          defaultValue: 42,
        })
        .raw();

      expectTypeOf(env.VAR1).toEqualTypeOf<string>();
      expectTypeOf(env.VAR2).toEqualTypeOf<number>();
    });

    it("should infer nullable types with optional", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "NULLABLE_VAR",
          schema: z.string().nullable(),
          isOptional: true,
        })
        .raw();

      expectTypeOf(env.NULLABLE_VAR).toEqualTypeOf<string | null | undefined>();
    });

    it("should infer complex nested object types", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "DATABASE_CONFIG",
          schema: z.string()
            .transform((str) => JSON.parse(str))
            .pipe(
              z.object({
                host: z.string(),
                port: z.number(),
                credentials: z.object({
                  username: z.string(),
                  password: z.string(),
                }),
              })
            ),
          defaultValue: '{"host":"localhost","port":5432,"credentials":{"username":"user","password":"pass"}}',
        })
        .raw();

      expectTypeOf(env.DATABASE_CONFIG).toEqualTypeOf<{
        host: string;
        port: number;
        credentials: {
          username: string;
          password: string;
        };
      }>();
    });

    it("should infer record types", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "FEATURE_FLAGS",
          schema: z.string()
            .transform((str) => JSON.parse(str))
            .pipe(z.record(z.boolean())),
          defaultValue: '{}',
        })
        .raw();

      expectTypeOf(env.FEATURE_FLAGS).toEqualTypeOf<Record<string, boolean>>();
    });

    it("should handle literal types", () => {
      const env = EnvManagerBuilder.empty()
        .fromProcess({
          name: "APP_NAME",
          schema: z.literal("my-app"),
          defaultValue: "my-app",
        })
        .raw();

      expectTypeOf(env.APP_NAME).toEqualTypeOf<"my-app">();
    });
  });

  describe("buildManager() return types", () => {
    it("should infer correct manager type", () => {
      const manager = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          schema: z.coerce.number(),
          defaultValue: 3000,
        })
        .buildManager();

      const port = manager.get("PORT");
      expectTypeOf(port).toEqualTypeOf<number>();
    });

    it("should infer multiple property types in manager", () => {
      const manager = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          schema: z.coerce.number(),
          defaultValue: 3000,
        })
        .fromProcess({
          name: "NODE_ENV",
          schema: z.enum(["development", "production"]),
          defaultValue: "development",
        })
        .fromProcess({
          name: "API_KEY",
          isOptional: true,
        })
        .buildManager();

      expectTypeOf(manager.get("PORT")).toEqualTypeOf<number>();
      expectTypeOf(manager.get("NODE_ENV")).toEqualTypeOf<"development" | "production">();
      expectTypeOf(manager.get("API_KEY")).toEqualTypeOf<string | undefined>();
    });

    it("should only accept valid keys in manager.get()", () => {
      const manager = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          defaultValue: "3000",
        })
        .fromProcess({
          name: "NODE_ENV",
          defaultValue: "development",
        })
        .buildManager();

      // Should accept valid keys
      expectTypeOf(manager.get).parameter(0).toMatchTypeOf<"PORT" | "NODE_ENV">();
    });
  });

  describe("envEntries type", () => {
    it("should have correct envEntries type structure", () => {
      const builder = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          schema: z.coerce.number(),
          defaultValue: 3000,
        });

      expectTypeOf(builder.envEntries).toBeObject();
      expectTypeOf(builder.envEntries).toHaveProperty("PORT");
    });
  });
});
