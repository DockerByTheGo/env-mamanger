import { describe, it, expectTypeOf } from "vitest";
import { z } from "zod/v3";
import { EnvManager } from "../src/EnvManager";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder";

describe("EnvManager - Type Tests", () => {
  describe("get method return types", () => {
    it("should infer string type from strategy", () => {
      const schema = {
        PORT: {
          name: "PORT",
          strategy: () => "3000",
          schema: z.string(),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const port = manager.get("PORT");

      expectTypeOf(port).toEqualTypeOf<string>();
    });

    it("should infer number type from coerce schema", () => {
      const schema = {
        PORT: {
          name: "PORT",
          strategy: () => "3000",
          schema: z.coerce.number(),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const port = manager.get("PORT");

      expectTypeOf(port).toEqualTypeOf<number>();
    });

    it("should infer boolean type from coerce schema", () => {
      const schema = {
        ENABLE_FEATURE: {
          name: "ENABLE_FEATURE",
          strategy: () => "true",
          schema: z.coerce.boolean(),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const enabled = manager.get("ENABLE_FEATURE");

      expectTypeOf(enabled).toEqualTypeOf<boolean>();
    });

    it("should infer enum type from schema", () => {
      const schema = {
        NODE_ENV: {
          name: "NODE_ENV",
          strategy: () => "development" as const,
          schema: z.enum(["development", "production", "test"]),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const env = manager.get("NODE_ENV");

      expectTypeOf(env).toEqualTypeOf<"development" | "production" | "test">();
    });

    it("should infer optional type when isOptional is true", () => {
      const schema = {
        API_KEY: {
          name: "API_KEY",
          strategy: () => undefined as string | undefined,
          schema: z.string(),
          isOptional: true,
        },
      } as const;

      const manager = EnvManager.new(schema);
      const apiKey = manager.get("API_KEY");

      expectTypeOf(apiKey).toEqualTypeOf<string | undefined>();
    });

    it("should infer array type from transform", () => {
      const schema = {
        ALLOWED_HOSTS: {
          name: "ALLOWED_HOSTS",
          strategy: () => "localhost,example.com",
          schema: z.string().transform((str) => str.split(",")),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const hosts = manager.get("ALLOWED_HOSTS");

      expectTypeOf(hosts).toEqualTypeOf<string[]>();
    });

    it("should infer object type from transform and pipe", () => {
      const schema = {
        CONFIG: {
          name: "CONFIG",
          strategy: () => '{"host":"localhost","port":3000}',
          schema: z.string()
            .transform((str) => JSON.parse(str))
            .pipe(
              z.object({
                host: z.string(),
                port: z.number(),
              })
            ),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const config = manager.get("CONFIG");

      expectTypeOf(config).toEqualTypeOf<{ host: string; port: number }>();
    });

    it("should infer union types", () => {
      const schema = {
        LOG_LEVEL: {
          name: "LOG_LEVEL",
          strategy: () => "info" as const,
          schema: z.union([
            z.literal("debug"),
            z.literal("info"),
            z.literal("warn"),
            z.literal("error"),
          ]),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const level = manager.get("LOG_LEVEL");

      expectTypeOf(level).toEqualTypeOf<"debug" | "info" | "warn" | "error">();
    });

    it("should infer nullable types", () => {
      const schema = {
        NULLABLE_VAR: {
          name: "NULLABLE_VAR",
          strategy: () => null as string | null,
          schema: z.string().nullable(),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const value = manager.get("NULLABLE_VAR");

      expectTypeOf(value).toEqualTypeOf<string | null>();
    });
  });

  describe("integration with EnvManagerBuilder types", () => {
    it("should infer correct types from builder", () => {
      const builder = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          schema: z.coerce.number(),
          defaultValue: 3000,
        })
        .fromProcess({
          name: "NODE_ENV",
          schema: z.enum(["development", "production"]),
          defaultValue: "development",
        });

      const manager = builder.buildManager();

      expectTypeOf(manager.get("PORT")).toEqualTypeOf<number>();
      expectTypeOf(manager.get("NODE_ENV")).toEqualTypeOf<"development" | "production">();
    });

    it("should infer optional types from builder", () => {
      const builder = EnvManagerBuilder.empty()
        .fromProcess({
          name: "API_KEY",
          isOptional: true,
        });

      const manager = builder.buildManager();

      expectTypeOf(manager.get("API_KEY")).toEqualTypeOf<string | undefined>();
    });

    it("should infer multiple property types from builder", () => {
      const builder = EnvManagerBuilder.empty()
        .fromProcess({
          name: "PORT",
          schema: z.coerce.number(),
          defaultValue: 3000,
        })
        .fromProcess({
          name: "ENABLE_FEATURE",
          schema: z.coerce.boolean(),
          defaultValue: false,
        })
        .fromProcess({
          name: "API_KEY",
          isOptional: true,
        });

      const manager = builder.buildManager();

      expectTypeOf(manager.get("PORT")).toEqualTypeOf<number>();
      expectTypeOf(manager.get("ENABLE_FEATURE")).toEqualTypeOf<boolean>();
      expectTypeOf(manager.get("API_KEY")).toEqualTypeOf<string | undefined>();
    });

    it("should preserve literal types in keys", () => {
      const builder = EnvManagerBuilder.empty()
        .fromProcess({
          name: "MY_CUSTOM_VAR",
          defaultValue: "value",
        });

      const manager = builder.buildManager();

      // Should have the exact property name
      expectTypeOf(manager.get).parameter(0).toEqualTypeOf<"MY_CUSTOM_VAR">();
    });

    it("should infer complex nested types from builder", () => {
      const builder = EnvManagerBuilder.empty()
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
        });

      const manager = builder.buildManager();
      const config = manager.get("DATABASE_CONFIG");

      expectTypeOf(config).toEqualTypeOf<{
        host: string;
        port: number;
        credentials: {
          username: string;
          password: string;
        };
      }>();
    });

    it("should infer record types from builder", () => {
      const builder = EnvManagerBuilder.empty()
        .fromProcess({
          name: "FEATURE_FLAGS",
          schema: z.string()
            .transform((str) => JSON.parse(str))
            .pipe(z.record(z.boolean())),
          defaultValue: '{}',
        });

      const manager = builder.buildManager();
      const flags = manager.get("FEATURE_FLAGS");

      expectTypeOf(flags).toEqualTypeOf<Record<string, boolean>>();
    });

    it("should handle custom strategy types", () => {
      const builder = EnvManagerBuilder.empty()
        .add({
          name: "CUSTOM",
          strategy: () => 42,
          schema: z.number(),
        });

      const manager = builder.buildManager();

      expectTypeOf(manager.get("CUSTOM")).toEqualTypeOf<number>();
    });
  });

  describe("schema type constraints", () => {
    it("should only accept valid keys", () => {
      const schema = {
        PORT: {
          name: "PORT",
          strategy: () => "3000",
          schema: z.string(),
        },
        NODE_ENV: {
          name: "NODE_ENV",
          strategy: () => "development",
          schema: z.string(),
        },
      } as const;

      const manager = EnvManager.new(schema);

      // Should accept valid keys
      expectTypeOf(manager.get).parameter(0).toMatchTypeOf<"PORT" | "NODE_ENV">();
    });

    it("should infer literal string types", () => {
      const schema = {
        APP_NAME: {
          name: "APP_NAME",
          strategy: () => "my-app" as const,
          schema: z.literal("my-app"),
        },
      } as const;

      const manager = EnvManager.new(schema);
      const appName = manager.get("APP_NAME");

      expectTypeOf(appName).toEqualTypeOf<"my-app">();
    });
  });
});
