import type { ZodType } from "zod/v3";
import { z } from "zod/v3";
import { EnvManager } from "./EnvManager";
import type { ZodString } from "zod/v3";
import type { EnvConfig } from "./Env";



export type Optionable<T, TOptional extends boolean = false> = TOptional extends true ? T | undefined : T;

export type EnvConfigDefault = EnvConfig<ZodString, false>;

export type EnvSchema = Record<string, EnvConfigDefault>

export class EnvManagerBuilder<TEnv extends EnvSchema > {

  public readonly envEntries: TEnv = {}
  /**
   * Prebuilt strategy for getting environment variables from process.env
   */


  //  we make the  constructor private since it breaks the intellisense because we cant manually type the return type of the constructor  
  private constructor(){ 

  }

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
    TSchema extends ZodType,
    TOptional extends boolean = false,
    TConfig extends EnvConfig<TSchema, TOptional> = EnvConfig<TSchema, TOptional>
  >(
    config: TConfig
  ): EnvManagerBuilder<TEnv & Record<TName, TConfig>> {
    this.envEntries[config.name] = ({ 
        ...config,
        schema: config.schema ?? z.string() as any,
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
    TSchema extends ZodType,
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
    return this.envEntries 
  }
  
  buildManager(): EnvManager<TEnv> {
    return EnvManager.new(this.envEntries as TEnv);
  }
}
