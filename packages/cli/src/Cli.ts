import {CliCore} from "@tsed/cli-core";
import chalk from "chalk";

import commands from "./commands/index.js";
import {PKG, TEMPLATE_DIR} from "./constants/index.js";
import {ArchitectureConvention, ProjectConvention} from "./interfaces/index.js";

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

    await this.updateNotifier(pkg);

    return super.bootstrap(opts, Cli);
  }
}
