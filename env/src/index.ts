import z from "zod/v3";
import { EnvManager } from "./EnvManager";
import { EnvManagerBuilder } from "./EnvManagerBuilder";

// Usage example for EnvManager
const envManager = EnvManager.new({
  PORT: z.string().min(1).max(5).default("3000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const env = envManager.envs;

console.log(env.PORT); // ✅ "3000"
console.log(env.NODE_ENV); // ✅ "development"

// Usage example for EnvManagerBuilder
const builder = new EnvManagerBuilder();

const customEnv = builder
  .fromProcess({ 
    name: "PORT", 
    defaultValue: "3000" 
  })
  .fromProcess({ 
    name: "NODE_ENV", 
    schema: z.enum(["development", "production"]), 
    isOptional: true 
  })
  .add({
    name: "CUSTOM_VAR",
    strategy: (name) => "custom-value",
  })
  .raw();

console.log(customEnv.PORT); // ✅ Type-safe access with IntelliSense
console.log(customEnv.NODE_ENV); // ✅ string | undefined (because isOptional: true)
console.log(customEnv.CUSTOM_VAR); // ✅ string

;
