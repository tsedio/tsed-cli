import {Inject} from "@tsed/di";
import {CliExeca, PackageManagersModule} from "@tsed/cli-core";

export abstract class BaseRuntime {
  abstract readonly name: string;
  abstract readonly cmd: string;
  readonly order: number = 10;

  @Inject(PackageManagersModule)
  protected packageManagers: PackageManagersModule;

  @Inject(CliExeca)
  protected cliExeca: CliExeca;

  get packageManager() {
    return this.packageManagers.get();
  }

  files(): string[] {
    return [];
  }

  has() {
    try {
      this.cliExeca.runSync(this.cmd, ["--version"]);

      return true;
    } catch (er) {
      return false;
    }
  }

  run(args: string) {
    return `${this.packageManager.cmd} run ${args}`;
  }

  /**
   * Returns the compile command
   * @param src
   * @param out
   */
  abstract compile(src: string, out: string): string;

  /**
   * Returns the start dev command
   * @param main
   */
  abstract startDev(main: string): string;

  /**
   * Returns the start production command
   * @param args
   */
  abstract startProd(args: string): string;

  dependencies(): Record<string, any> {
    return {};
  }

  devDependencies(): Record<string, any> {
    return {};
  }
}
