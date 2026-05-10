import z from "zod";
import { EnvManagerBuilder } from "../src/EnvManagerBuilder.ts";

const secretsStore = {
  DATABASE_URL: "https://db.example.com:5432/app",
  SERVICE_TOKEN: "svc_token_123456789",
};

const manager = EnvManagerBuilder.empty()
  .add({
    name: "DATABASE_URL",
    strategy: name => secretsStore[name as keyof typeof secretsStore],
    schema: z.string().url(),
  })
  .add({
    name: "SERVICE_TOKEN",
    strategy: name => secretsStore[name as keyof typeof secretsStore],
    schema: z.string().min(10),
  })
  .buildManager();

console.log("DATABASE_URL:", manager.get("DATABASE_URL"));
console.log("SERVICE_TOKEN:", manager.get("SERVICE_TOKEN"));
