import z from "zod";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder.ts";

process.env.NODE_ENV = "production";
process.env.PORT = "4000";
process.env.DATABASE_CONFIG = JSON.stringify({
  host: "db.internal",
  port: 5432,
  credentials: {
    username: "app-user",
    password: "super-secret-password",
  },
  poolSize: 20,
});
process.env.CORS_ORIGINS = "https://app.example.com,https://admin.example.com";

const manager = EnvManagerBuilder.empty()
  .fromProcess({
    name: "NODE_ENV",
    schema: z.enum(["development", "test", "production"]),
  })
  .fromProcess({
    name: "PORT",
    schema: z.coerce.number().int().positive(),
  })
  .fromProcess({
    name: "DATABASE_CONFIG",
    schema: z.string()
      .transform(value => JSON.parse(value))
      .pipe(z.object({
        host: z.string().min(1),
        port: z.number().int().positive(),
        credentials: z.object({
          username: z.string().min(1),
          password: z.string().min(8),
        }),
        poolSize: z.number().int().positive(),
      })),
  })
  .fromProcess({
    name: "CORS_ORIGINS",
    schema: z.string().transform(value =>
      value.split(",").map(origin => origin.trim()).filter(Boolean),
    ),
  })
  .buildManager();

const config = manager.getAll();

console.log("Production config:");
console.log(JSON.stringify(config, null, 2));
