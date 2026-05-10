import z from "zod";
import { EnvManager } from "../src/EnvManager.ts";

const envManager = EnvManager.new({
  APP_NAME: {
    name: "APP_NAME",
    strategy: () => "env-manager-demo",
    schema: z.string().min(1),
  },
});

const appName = envManager.get("APP_NAME");

console.log("APP_NAME:", appName);
