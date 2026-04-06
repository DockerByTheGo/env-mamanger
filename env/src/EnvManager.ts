import type { infer as zInfer, ZodObject, ZodRawShape } from "zod/v3";

import { z } from "zod/v3";
import type { EnvConfigDefault, EnvSchema } from "./EnvManagerBuilder";
import type { EnvConfig } from "./Env";

export class EnvManager<T extends EnvSchema> {
  private constructor(private readonly schema: T) {}

  get<TKey extends keyof T>(name: TKey): ReturnType<T[TKey]["strategy"]> {
    const config = this.schema[name];
    
    if (!config) {
      throw new Error(`Environment variable "${String(name)}" not found in schema`);
    }
    
    const rawValue = config.strategy(name as string);
    
    if (rawValue === undefined) {
      if (config.defaultValue !== undefined) {
        return config.defaultValue as ReturnType<T[TKey]["strategy"]>;
      } else if (config.isOptional) {
        return undefined as ReturnType<T[TKey]["strategy"]>;
      } else {
        throw new Error(`Environment variable "${String(name)}" is required but not found`);
      }
    }
    
    if (!config.schema) {
      return rawValue as ReturnType<T[TKey]["strategy"]>;
    }
    
    const parsed = config.schema.parse(rawValue);
    return parsed as ReturnType<T[TKey]["strategy"]>;
  }

  static new<TEnv extends EnvSchema>(schema: TEnv): EnvManager<TEnv> {
    return new EnvManager(schema);
  }
  

  getAll(): {
    [Env in keyof T] : ReturnType<T[Env]["strategy"]>
  } {
    return
  }
}