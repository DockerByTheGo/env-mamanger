import z from "zod";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder.ts";

process.env.PORT = "8080";
process.env.ENABLE_CACHE = "true";
process.env.REQUEST_TIMEOUT_MS = "15000";

const manager = EnvManagerBuilder.empty()
  .fromProcess({
    name: "PORT",
    schema: z.coerce.number().int().min(1).max(65535),
  })
  .fromProcess({
    name: "ENABLE_CACHE",
    schema: z.coerce.boolean(),
  })
  .fromProcess({
    name: "REQUEST_TIMEOUT_MS",
    schema: z.coerce.number().int().positive(),
  })
  .buildManager();

console.log("PORT:", manager.get("PORT"));
console.log("ENABLE_CACHE:", manager.get("ENABLE_CACHE"));
console.log("REQUEST_TIMEOUT_MS:", manager.get("REQUEST_TIMEOUT_MS"));
