import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {MochaGenerateHook} from "./hooks/MochaGenerateHook";
import {MochaInitHook} from "./hooks/MochaInitHook";

@Module({
  imports: [MochaInitHook, MochaGenerateHook]
})
export class CliPluginMochaModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-mocha")
  install() {
    this.addScripts();
    this.addDevDependencies();
  }

  addScripts() {
    const runner = this.packageJson.getRunCmd();

    this.packageJson.addScripts({
      test: `${runner} test:lint && ${runner} test:coverage`,
      "test:unit": "cross-env NODE_ENV=test mocha",
      "test:coverage": "cross-env NODE_ENV=test nyc mocha"
    });
  }

  addDevDependencies() {
    this.packageJson.addDevDependencies({
      "@types/chai": "latest",
      "@types/chai-as-promised": "latest",
      "@types/mocha": "latest",
      "@types/sinon": "latest",
      "@types/sinon-chai": "latest",
      chai: "latest",
      "chai-as-promised": "latest",
      mocha: "latest",
      nyc: "latest",
      sinon: "latest",
      "sinon-chai": "latest"
    });
  }
}
