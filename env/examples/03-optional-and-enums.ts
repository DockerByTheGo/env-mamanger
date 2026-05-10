import z from "zod";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder.ts";

delete process.env.API_KEY;
process.env.NODE_ENV = "development";

const manager = EnvManagerBuilder.empty()
  .fromProcess({
    name: "NODE_ENV",
    schema: z.enum(["development", "test", "production"]),
  })
  .fromProcess({
    name: "API_KEY",
    schema: z.string().min(10),
    isOptional: true,
  })
  .buildManager();

console.log("NODE_ENV:", manager.get("NODE_ENV"));
console.log("API_KEY:", manager.get("API_KEY"));
