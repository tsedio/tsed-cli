import {CliCore} from "@tsed/cli-core";

export class Cli extends CliCore {
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
    this.createAliases(pkg);
    this.updateNotifier(pkg);

    return super.bootstrap(settings, Cli);
  }

  static createAliases(pkg: any) {
    const alias = require("module-alias");
    alias.addAliases({
      "@tsed/core": require.resolve("@tsed/core"),
      "@tsed/di": require.resolve("@tsed/di"),
      "@tsed/cli-core": require.resolve("@tsed/cli-core")
    });

    if (pkg.name) {
      alias.addAlias({
        [pkg.name]: require.resolve(pkg.name)
      });
    }
  }
}
