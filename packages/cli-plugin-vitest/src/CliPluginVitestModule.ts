import {RuntimesModule} from "@tsed/cli";
import {inject, Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";

import {VitestGenerateHook} from "./hooks/VitestGenerateHook.js";
import {VitestInitHook} from "./hooks/VitestInitHook.js";

@Module({
  imports: [VitestInitHook, VitestGenerateHook]
})
export class CliPluginVitestModule {
  protected runtimes = inject(RuntimesModule);
  protected packageJson = inject(ProjectPackageJson);

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
