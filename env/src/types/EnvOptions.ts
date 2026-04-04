import type { ZodSchema } from "zod/v3";

import { panic, Try } from "@blazyts/better-standard-library";

type OrNull<T> = T | null;
type isFunctionThatAlwaysThrows<T extends Function> = T extends () => never ? T : never;

function isNotNone<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}

function isNone<T>(v: T | null | undefined): boolean {
  return v === null || v === undefined;
}

export class EnvOptions<
  TName extends string,
  Shape,
  TDefaultValue extends OrNull<Shape>,
  TDefaultResolver extends (() => Shape) | (() => never),
> {
  constructor(
    private name: TName,
    private resolveAtStartup: boolean = false,
    private handleNotFound: (name: TName) => void = () => Try(this.defaultValue, {
      ifNone: () => panic("name not found and def wasnt specified"),
      ifNotNone: v => v,
    }),
    private schema: ZodSchema<Shape>,
    private resolver?: (name: TName) => Shape,
    private cacheAfterGeettingOnce: boolean = true,
    private cacheInvalidator?: (name: TName, cachedValue: Shape) => boolean,
    private defaultValue?: TDefaultValue,
  ) {}

  get get(): TDefaultValue extends null ? Shape | null : Shape {
    const rawEnv = process.env[this.name];
    if (isNotNone(rawEnv)) {
      return this.schema.parse(rawEnv);
    }

    if (isNone(this.defaultValue)) {
      this.handleNotFound(this.name);
    }
    else {
      return this.defaultValue;
    }
  }
}
