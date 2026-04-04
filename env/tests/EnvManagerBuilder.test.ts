import { describe, it, expect, beforeEach } from "bun:test";
import { z } from "zod/v3";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder";

describe("EnvManagerBuilder", () => {
  beforeEach(() => {
    // Clean up process.env before each test
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
  });

  it("should build env from process.env with default values", () => {
    const env = EnvManagerBuilder
        .empty()
      .fromProcess({
        name: "PORT",
        defaultValue: "3000",
      })
      .fromProcess({
        name: "NODE_ENV",
        schema: z.enum(["development", "production"]),
        defaultValue: "development",

      })
      .buildManager()
      const port = env.get("PORT")


    expect(env.PORT).toBe("3000");
    expect(env.NODE_ENV).toBe("development");
  });

  it("should read values from process.env when available", () => {
    process.env.PORT = "8080";
    process.env.NODE_ENV = "production";

    const env = new EnvManagerBuilder()
      .fromProcess({
        name: "PORT",
        defaultValue: "3000",
      })
      .fromProcess({
        name: "NODE_ENV",
        schema: z.enum(["development", "production"]),
        defaultValue: "development",
      })
      .raw();

    expect(env.PORT).toBe("8080");
    expect(env.NODE_ENV).toBe("production");
  });

  it("should handle optional environment variables", () => {
    const env = new EnvManagerBuilder()
      .fromProcess({
        name: "PORT",
        defaultValue: "3000",
      })
      .fromProcess({
        name: "DATABASE_URL",
        isOptional: true,
      })
      .raw();

    expect(env.PORT).toBe("3000");
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("should throw error for required env vars without default", () => {
    expect(() => {
      new EnvManagerBuilder()
        .fromProcess({
          name: "REQUIRED_VAR",
        })
        .raw();
    }).toThrow('Environment variable "REQUIRED_VAR" is required but not found');
  });

  it("should use custom strategy", () => {
    const mockConfig = {
      API_KEY: "secret-key-123",
      SERVICE_URL: "https://api.example.com",
    };

    const env = new EnvManagerBuilder()
      .add({
        name: "API_KEY",
        strategy: (name) => mockConfig[name as keyof typeof mockConfig],
      })
      .add({
        name: "SERVICE_URL",
        strategy: (name) => mockConfig[name as keyof typeof mockConfig],
        schema: z.string().url(),
      })
      .raw();

    expect(env.API_KEY).toBe("secret-key-123");
    expect(env.SERVICE_URL).toBe("https://api.example.com");
  });

  it("should validate with zod schema", () => {
    process.env.PORT = "not-a-number";

    expect(() => {
      new EnvManagerBuilder()
        .fromProcess({
          name: "PORT",
          schema: z.coerce.number(),
        })
        .raw();
    }).toThrow();
  });

  it("should coerce types with zod", () => {
    process.env.PORT = "8080";
    process.env.ENABLE_FEATURE = "true";

    const env = new EnvManagerBuilder()
      .fromProcess({
        name: "PORT",
        schema: z.coerce.number(),
      })
      .fromProcess({
        name: "ENABLE_FEATURE",
        schema: z.coerce.boolean(),
      })
      .raw();

    expect(env.PORT).toBe(8080);
    expect(typeof env.PORT).toBe("number");
    expect(env.ENABLE_FEATURE).toBe(true);
    expect(typeof env.ENABLE_FEATURE).toBe("boolean");
  });

  it("should chain multiple methods", () => {
    process.env.NODE_ENV = "production";

    const env = new EnvManagerBuilder()
      .fromProcess({
        name: "PORT",
        schema: z.coerce.number(),
        defaultValue: 3000,
      })
      .fromProcess({
        name: "NODE_ENV",
        schema: z.enum(["development", "production"]),
      })
      .add({
        name: "CUSTOM_VAR",
        strategy: () => "custom-value",
        schema: z.string(),
      })
      .raw();

    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe("production");
    expect(env.CUSTOM_VAR).toBe("custom-value");
  });
});
