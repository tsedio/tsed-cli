import {RuntimesModule} from "@tsed/cli";
import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

import {VitestGenerateHook} from "./hooks/VitestGenerateHook.js";
import {VitestInitHook} from "./hooks/VitestInitHook.js";

@Module({
  imports: [VitestInitHook, VitestGenerateHook]
})
export class CliPluginVitestModule {
  @Inject()
  runtimes: RuntimesModule;

  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-vitest")
  install() {
    this.addScripts();
    this.addDevDependencies();
  }

  addScripts() {
    const runtime = this.runtimes.get();

    this.packageJson.addScripts({
      test: `${runtime.run("test:lint")} && ${runtime.run("test:coverage")}`,
      "test:unit": "cross-env NODE_ENV=test vitest run",
      "test:watch": "cross-env NODE_ENV=test vitest",
      "test:coverage": `cross-env NODE_ENV=test vitest run --coverage`
    });
  }

  addDevDependencies() {
    this.packageJson.addDevDependencies({
      vitest: "latest",
      "unplugin-swc": "latest",
      "@vitest/coverage-v8": "latest",
      "@swc/core": "latest"
    });
  }
}
