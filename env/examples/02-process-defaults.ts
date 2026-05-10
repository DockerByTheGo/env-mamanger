import z from "zod";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder.ts";

delete process.env.PORT;
process.env.HOST = "127.0.0.1";

const manager = EnvManagerBuilder.empty()
  .fromProcess({
    name: "HOST",
    schema: z.string().min(1),
  })
  .fromProcess({
    name: "PORT",
    schema: z.coerce.number().int().positive(),
    defaultValue: 3000,
  })
  .buildManager();

console.log("HOST:", manager.get("HOST"));
console.log("PORT:", manager.get("PORT"));
