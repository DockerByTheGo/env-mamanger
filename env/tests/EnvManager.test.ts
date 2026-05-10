import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod/v3";
import { EnvManager } from "../src/EnvManager";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder";

describe("EnvManager", () => {
  beforeEach(() => {
    // Clean up process.env before each test
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
    delete process.env.API_KEY;
  });

  describe("static new", () => {
    describe("get", () => {
      it("should get env value by key", () => {
        const schema = {
          PORT: {
            name: "PORT",
            strategy: () => "3000",
            schema: z.string(),
          },
        };

        const manager = EnvManager.new(schema);
        const port = manager.get("PORT");

        expect(port).toBe("3000");
      });

      it("should get value from process.env strategy", () => {
        process.env.PORT = "8080";

        const schema = {
          PORT: {
            name: "PORT",
            strategy: (name: string) => process.env[name],
            schema: z.string(),
          },
        };

        const manager = EnvManager.new(schema);
        const port = manager.get("PORT");

        expect(port).toBe("8080");
      });

      it("should return undefined for optional missing value", () => {
        const schema = {
          API_KEY: {
            name: "API_KEY",
            strategy: () => undefined,
            schema: z.string(),
            isOptional: true,
          },
        };

        const manager = EnvManager.new(schema);
        const apiKey = manager.get("API_KEY");

        expect(apiKey).toBeUndefined();
      });

      it("should return default value when strategy returns undefined", () => {
        const schema = {
          PORT: {
            name: "PORT",
            strategy: () => undefined,
            schema: z.string(),
            defaultValue: "3000",
          },
        };

        const manager = EnvManager.new(schema);
        const port = manager.get("PORT");

        expect(port).toBe("3000");
      });

      it("should validate value with schema", () => {
        const schema = {
          PORT: {
            name: "PORT",
            strategy: () => "8080",
            schema: z.coerce.number(),
          },
        };

        const manager = EnvManager.new(schema);
        const port = manager.get("PORT");

        expect(port).toBe(8080);
        expect(typeof port).toBe("number");
      });

      it("should handle enum validation", () => {
        const schema = {
          NODE_ENV: {
            name: "NODE_ENV",
            strategy: () => "production",
            schema: z.enum(["development", "production", "test"]),
          },
        };

        const manager = EnvManager.new(schema);
        const env = manager.get("NODE_ENV");

        expect(env).toBe("production");
      });

      it("should throw for invalid enum value", () => {
        const schema = {
          NODE_ENV: {
            name: "NODE_ENV",
            strategy: () => "invalid",
            schema: z.enum(["development", "production"]),
          },
        };

        const manager = EnvManager.new(schema);

        expect(() => manager.get("NODE_ENV")).toThrow();
      });
    });

    describe("integration with EnvManagerBuilder", () => {
      it("should work with builder-created schema", () => {
        process.env.PORT = "8080";
        process.env.NODE_ENV = "production";

        const builder = EnvManagerBuilder.empty()
          .fromProcess({
            name: "PORT",
            schema: z.coerce.number(),
          })
          .fromProcess({
            name: "NODE_ENV",
            schema: z.enum(["development", "production"]),
          });

        const manager = builder.buildManager();

        expect(manager.get("PORT")).toBe(8080);
        expect(manager.get("NODE_ENV")).toBe("production");
      });

      it("should handle optional values from builder", () => {
        const builder = EnvManagerBuilder.empty()
          .fromProcess({
            name: "API_KEY",
            isOptional: true,
          });

        const manager = builder.buildManager();

        expect(manager.get("API_KEY")).toBeUndefined();
      });

      it("should handle default values from builder", () => {
        const builder = EnvManagerBuilder.empty()
          .fromProcess({
            name: "PORT",
            defaultValue: "3000",
          });

        const manager = builder.buildManager();

        expect(manager.get("PORT")).toBe("3000");
      });

      it("should handle custom strategies from builder", () => {
        const mockConfig = {
          API_KEY: "secret-key-123",
        };

        const builder = EnvManagerBuilder.empty()
          .add({
            name: "API_KEY",
            strategy: name => mockConfig[name as keyof typeof mockConfig],
          });

        const manager = builder.buildManager();

        expect(manager.get("API_KEY")).toBe("secret-key-123");
      });
    });

    describe("complex scenarios", () => {
      it("should handle transformed values", () => {
        process.env.ALLOWED_HOSTS = "localhost,example.com";

        const schema = {
          ALLOWED_HOSTS: {
            name: "ALLOWED_HOSTS",
            strategy: (name: string) => process.env[name],
            schema: z.string().transform(str => str.split(",")),
          },
        };

        const manager = EnvManager.new(schema);
        const hosts = manager.get("ALLOWED_HOSTS");

        expect(hosts).toEqual(["localhost", "example.com"]);
      });

      it("should handle JSON parsing", () => {
        process.env.CONFIG = "{\"host\":\"localhost\",\"port\":5432}";

        const schema = {
          CONFIG: {
            name: "CONFIG",
            strategy: (name: string) => process.env[name],
            schema: z.string().transform(str => JSON.parse(str)).pipe(
              z.object({
                host: z.string(),
                port: z.number(),
              }),
            ),
          },
        };

        const manager = EnvManager.new(schema);
        const config = manager.get("CONFIG");

        expect(config).toEqual({ host: "localhost", port: 5432 });
      });

      it("should handle boolean coercion", () => {
        process.env.ENABLE_FEATURE = "true";

        const schema = {
          ENABLE_FEATURE: {
            name: "ENABLE_FEATURE",
            strategy: (name: string) => process.env[name],
            schema: z.coerce.boolean(),
          },
        };

        const manager = EnvManager.new(schema);
        const enabled = manager.get("ENABLE_FEATURE");

        expect(enabled).toBe(true);
        expect(typeof enabled).toBe("boolean");
      });

      it("should validate URL format", () => {
        process.env.DATABASE_URL = "https://example.com/db";

        const schema = {
          DATABASE_URL: {
            name: "DATABASE_URL",
            strategy: (name: string) => process.env[name],
            schema: z.string().url(),
          },
        };

        const manager = EnvManager.new(schema);
        const url = manager.get("DATABASE_URL");

        expect(url).toBe("https://example.com/db");
      });

      it("should throw for invalid URL", () => {
        process.env.DATABASE_URL = "not-a-url";

        const schema = {
          DATABASE_URL: {
            name: "DATABASE_URL",
            strategy: (name: string) => process.env[name],
            schema: z.string().url(),
          },
        };

        const manager = EnvManager.new(schema);

        expect(() => manager.get("DATABASE_URL")).toThrow();
      });

      it("should handle custom refinements", () => {
        process.env.PASSWORD = "strong-password-123";

        const schema = {
          PASSWORD: {
            name: "PASSWORD",
            strategy: (name: string) => process.env[name],
            schema: z.string().refine(val => val.length >= 8, {
              message: "Password must be at least 8 characters",
            }),
          },
        };

        const manager = EnvManager.new(schema);
        const password = manager.get("PASSWORD");

        expect(password).toBe("strong-password-123");
      });

      it("should throw for failed refinements", () => {
        process.env.PASSWORD = "weak";

        const schema = {
          PASSWORD: {
            name: "PASSWORD",
            strategy: (name: string) => process.env[name],
            schema: z.string().refine(val => val.length >= 8, {
              message: "Password must be at least 8 characters",
            }),
          },
        };

        const manager = EnvManager.new(schema);

        expect(() => manager.get("PASSWORD")).toThrow();
      });
    });
  });
});
