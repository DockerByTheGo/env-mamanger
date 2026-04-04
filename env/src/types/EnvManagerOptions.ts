export type EnvManagerOptionsShape = {
  resolveAllAtStartup: boolean;
};

export class EnvManagerOptions<T extends EnvManagerOptionsShape> {
  constructor(
    public readonly options: T,
  ) {

  }
}
