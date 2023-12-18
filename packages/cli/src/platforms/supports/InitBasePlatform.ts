export interface InitBasePlatform {
  readonly name: string;

  dependencies(ctx: any): Record<string, string>;

  devDependencies(ctx: any): Record<string, string>;
}
