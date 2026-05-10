import type { ZodType } from "zod";
import type z from "zod";
import type { Optionable } from "./EnvManagerBuilder";

export interface EnvConfig<
  TSchema extends ZodType,
  TOptional extends boolean = false,
  DTInfered extends z.infer<TSchema> = z.infer<TSchema>,
> {
  name: string;
  strategy: (name: string) => TOptional extends true ? Optionable<DTInfered> : DTInfered;
  schema?: TSchema;
  defaultValue?: DTInfered;
  isOptional?: TOptional;
}
