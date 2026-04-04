import type { infer as zInfer, ZodObject, ZodRawShape } from "zod/v3";

import { z } from "zod/v3";
import type { EnvConfig, EnvConfigDefault, EnvSchema } from "./EnvManagerBuilder";

export class EnvManager<T extends EnvSchema> {
  get<TKey extends keyof T>(name: TKey): ReturnType<T[TKey]["strategy"]> {
    return
  }
}