import type { TypeOf as zInfer, ZodType } from "zod/v3";
import type { Optionable } from "./EnvManagerBuilder";

export interface EnvConfig<
  TSchema extends ZodType,
  TOptional extends boolean = false,
  DTInfered extends zInfer<TSchema> = zInfer<TSchema>,
> {
  name: string;
  strategy: (name: string) => TOptional extends true ? Optionable<DTInfered> : DTInfered;
  schema?: TSchema;
  defaultValue?: DTInfered;
  isOptional?: TOptional;
}
