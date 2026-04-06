import type { ZodType, TypeOf as zInfer } from "zod/v3";
import type { Optionable } from "./EnvManagerBuilder";


// export class EnvConfig<
//   TSchema extends ZodType,
//   TOptional extends boolean = false,
//   DTInfered extends zInfer<TSchema> = zInfer<TSchema>
// > {
//   constructor(
    
//   public readonly name: string,
//   public readonly strategy: (name: string) => TOptional extends true ? Optionable<DTInfered> : DTInfered,
//   public readonly schema?: TSchema,
//   public readonly defaultValue?: DTInfered,
//   public readonly isOptional?: TOptional,
//   ){}
// }


// new EnvConfig("jiji", )
export interface EnvConfig<
  TSchema extends ZodType,
  TOptional extends boolean = false,
  DTInfered extends zInfer<TSchema> = zInfer<TSchema>
> {
  name: string;
  strategy: (name: string) => TOptional extends true ? Optionable<DTInfered> : DTInfered;
  schema?: TSchema;
  defaultValue?: DTInfered;
  isOptional?: TOptional;
}
