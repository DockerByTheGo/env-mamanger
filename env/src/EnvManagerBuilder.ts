import type { ZodType, infer as zInfer } from "zod/v3";
import { z } from "zod/v3";
import { EnvManager } from "./EnvManager";
import type { ZodString } from "zod/v3";



export interface EnvConfig<
TSchema extends ZodType,
TOptional extends boolean = false,
DTInfered extends zInfer <TSchema> = zInfer<TSchema>
> {
  name: string;
  strategy: (name: string) => TOptional extends true 
  ? Optionable<DTInfered> 
  : DTInfered
  schema?: TSchema;
  defaultValue?: DTInfered;
  isOptional?: TOptional;
}

interface EnvEntry<T> {
  config: EnvConfig<T, any>;
}

type Optionable<T, TOptional extends boolean = false> = TOptional extends true ? T | undefined : T;

export type EnvConfigDefault = EnvConfig<ZodString, false>;

export type EnvSchema = Record<string, EnvConfigDefault>

/**
 * EnvManagerBuilder - A builder for creating type-safe environment configurations
 * 
 * @example
 * ```typescript
 * import { EnvManagerBuilder } from './EnvManagerBuilder';
 * import { z } from 'zod/v3';
 * 
 * const env = new EnvManagerBuilder()
 *   .fromProcess({ 
 *     name: "PORT", 
 *     defaultValue: "3000" 
 *   })
 *   .fromProcess({ 
 *     name: "NODE_ENV", 
 *     schema: z.enum(["development", "production"]), 
 *     isOptional: true 
 *   })
 *   .add({
 *     name: "API_KEY",
 *     strategy: (name) => getSecretFromVault(name),
 *   })
 *   .build();
 * 
 * // Type-safe access with IntelliSense
 * console.log(env.PORT);        // string
 * console.log(env.NODE_ENV);    // "development" | "production" | undefined
 * console.log(env.API_KEY);     // string
 * ```
 */
export class EnvManagerBuilder<TEnv extends EnvSchema > {
  private envEntries: EnvEntry<any>[] = [];

  /**
   * Prebuilt strategy for getting environment variables from process.env
   */

  static empty() {
    return new EnvManagerBuilder<{}>()
  }

  private static processStrategy = (name: string): string | undefined => {
    return process.env[name];
  };

  /**
   * Add an environment variable with full configuration
   * 
   * @example
   * ```typescript
   * builder.add({
   *   name: "DATABASE_URL",
   *   strategy: (name) => getFromConfigFile(name),
   *   schema: z.string().url(),
   *   defaultValue: "postgres://localhost:5432/db"
   * })
   * ```
   */
  add<
    TName extends string,
    T,
    TOptional extends boolean = false,
    TConfig extends EnvConfig<T, TOptional> = EnvConfig<T, TOptional>
  >(
    config: TConfig
  ): EnvManagerBuilder<TEnv & Record<TName, TConfig>> {
    this.envEntries.push({ 
      config: {
        ...config,
        schema: config.schema ?? z.string() as any,
      }
    });
    return this as any;
  }

  /**
   * Add an environment variable using the process.env strategy
   * 
   * @example
   * ```typescript
   * builder.fromProcess({ 
   *   name: "PORT", 
   *   defaultValue: "3000" 
   * })
   * ```
   */
  fromProcess<
    TName extends string,
    TSchema extends ZodType = ZodType<string>,
    TOptional extends boolean = false,
    TConfig extends EnvConfig<TSchema, TOptional> = EnvConfig<TSchema, TOptional>
  >(
    config: Omit<TConfig, "strategy">
  ): EnvManagerBuilder<TEnv & Record<TName, TConfig>> {
    return this.add({
      ...config,
      strategy: EnvManagerBuilder.processStrategy as any,
      schema: config.schema,
    } as any);
  }

  /**
   * Build the environment object by executing all strategies and validating with schemas
   * 
   * @throws {Error} If a required environment variable is missing and has no default value
   * @throws {ZodError} If validation fails for any environment variable
   */
  raw(): TEnv {
    const env: Record<string, any> = {};

    for (const { config } of this.envEntries) {
      const rawValue = config.strategy(config.name);
      
      if (rawValue === undefined) {
        if (config.defaultValue !== undefined) {
          env[config.name] = config.defaultValue;
        } else if (config.isOptional) {
          env[config.name] = undefined;
        } else {
          throw new Error(`Environment variable "${config.name}" is required but not found`);
        }
      } else {
        const parsed = config.schema!.parse(rawValue);
        env[config.name] = parsed;
      }
    }

    return env as TEnv;
  }
  
  buildManager(): EnvManager<TEnv> {
    return 
  }
}
