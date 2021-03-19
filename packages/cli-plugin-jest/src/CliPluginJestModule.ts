import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {JestGenerateHook} from "./hooks/JestGenerateHook";
import {JestInitHook} from "./hooks/JestInitHook";

@Module({
  imports: [JestInitHook, JestGenerateHook]
})
export class CliPluginJestModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-jest")
  install() {
    this.addScripts();
    this.addDevDependencies();
  }

  addScripts() {
    const runner = this.packageJson.getRunCmd();

    this.packageJson.addScripts({
      test: `${runner} test:lint && ${runner} test:coverage`,
      "test:unit": "cross-env NODE_ENV=test jest",
      "test:coverage": `${runner} test:unit`
    });
  }

  addDevDependencies() {
    this.packageJson.addDevDependencies({
      "@types/jest": "latest",
      jest: "latest",
      "ts-jest": "latest"
    });
  }
}
