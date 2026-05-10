import z from "zod";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder.ts";

process.env.ALLOWED_HOSTS = "localhost,example.com,api.example.com";
process.env.FEATURE_FLAGS = "{\"search\":true,\"billing\":false}";

const manager = EnvManagerBuilder.empty()
  .fromProcess({
    name: "ALLOWED_HOSTS",
    schema: z.string().transform(value =>
      value.split(",").map(host => host.trim()).filter(Boolean),
    ),
  })
  .fromProcess({
    name: "FEATURE_FLAGS",
    schema: z.string()
      .transform(value => JSON.parse(value))
      .pipe(z.object({
        search: z.boolean(),
        billing: z.boolean(),
      })),
  })
  .buildManager();

console.log("ALLOWED_HOSTS:", manager.get("ALLOWED_HOSTS"));
console.log("FEATURE_FLAGS:", manager.get("FEATURE_FLAGS"));
