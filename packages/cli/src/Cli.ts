import {CliCore} from "@tsed/cli-core";
import chalk from "chalk";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import alias from "module-alias";
import {PKG, TEMPLATE_DIR} from "./constants";
import commands from "./commands";
import {ArchitectureConvention, ProjectConvention} from "./interfaces";
import {InitCmdContext} from "./commands/init/InitCmd";
import {GenerateCmdContext} from "./commands/generate/GenerateCmd";

export class Cli extends CliCore {
  static defaults = {
    name: "tsed",
    pkg: PKG,
    templateDir: TEMPLATE_DIR,
    plugins: true,
    commands,
    defaultProjectPreferences() {
      return {
        convention: ProjectConvention.DEFAULT,
        architecture: ArchitectureConvention.DEFAULT
      };
    },
    project: {
      reinstallAfterRun: true
    },
    logger: {
      level: "info"
    }
  };

  static checkPackage(pkg: any) {
    if (!pkg) {
      console.log(chalk.red(`settings.pkg is required. Require the package.json of your CLI when you bootstrap the CLI.`));
      process.exit(1);
    }
  }

  static checkName(name: string) {
    if (!name) {
      console.log(chalk.red(`settings.name is required. Add the name of your CLI.`));
      process.exit(1);
    }
  }

  static checkPrecondition(settings: any) {
    const {pkg} = settings;

    this.checkPackage(pkg);
    this.checkName(pkg.name);

    if (pkg?.engines?.node) {
      this.checkNodeVersion(pkg.engines.node, pkg.name);
    }
  }

  static async bootstrap(settings: any = {}) {
    const opts: any = {
      ...Cli.defaults,
      ...settings
    };

    const {pkg} = opts;

    this.checkPrecondition(opts);
    this.createAliases();
    this.updateNotifier(pkg);

    return super.bootstrap(opts, Cli);
  }

  static async dispatch(cmd: "init", context: InitCmdContext): Promise<void>;
  static async dispatch(cmd: "generate", context: GenerateCmdContext): Promise<void>;
  static async dispatch(cmd: string, context: any) {
    this.createAliases();

    const cli = await this.create<Cli>({...Cli.defaults} as any, Cli);

    await cli.cliService.dispatch(cmd, context);
  }

  static createAliases() {
    alias.addAliases({
      "@tsed/core": require.resolve("@tsed/core"),
      "@tsed/di": require.resolve("@tsed/di"),
      "@tsed/schema": require.resolve("@tsed/schema"),
      "@tsed/cli-core": require.resolve("@tsed/cli-core"),
      "@tsed/cli": require.resolve("@tsed/cli")
    });
  }
}
