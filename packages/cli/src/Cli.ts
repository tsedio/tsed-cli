import {CliCore} from "@tsed/cli-core";
import * as chalk from "chalk";

export class Cli extends CliCore {
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

  static async bootstrap(settings: any) {
    const {pkg} = settings;

    this.checkPrecondition(settings);
    this.createAliases();
    this.updateNotifier(pkg);

    return super.bootstrap(settings, Cli);
  }

  static createAliases() {
    const alias = require("module-alias");
    alias.addAliases({
      "@tsed/core": require.resolve("@tsed/core"),
      "@tsed/di": require.resolve("@tsed/di"),
      "@tsed/cli-core": require.resolve("@tsed/cli-core"),
      "@tsed/cli": require.resolve("@tsed/cli")
    });
  }
}
