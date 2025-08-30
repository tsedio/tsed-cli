// Import templates to register them with the DI container
import "./templates/index.js";

import {RuntimesModule} from "@tsed/cli";
import {inject, Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";

import {JestGenerateHook} from "./hooks/JestGenerateHook.js";
import {JestInitHook} from "./hooks/JestInitHook.js";

@Module({
  imports: [JestInitHook, JestGenerateHook]
})
export class CliPluginJestModule {
  protected runtimes = inject(RuntimesModule);
  protected packageJson = inject(ProjectPackageJson);

  @OnAdd("@tsed/cli-plugin-jest")
  install() {
    this.addScripts();
    this.addDevDependencies();
  }

  addScripts() {
    const runtime = this.runtimes.get();

    this.packageJson.addScripts({
      "test:unit": "cross-env NODE_OPTIONS=--experimental-vm-modules NODE_ENV=test jest",
      "test:coverage": `${runtime.run("test:unit")} `
    });
  }

  addDevDependencies() {
    this.packageJson.addDevDependencies({
      "@types/jest": "latest",
      "@swc/jest": "latest",
      jest: "latest"
    });
  }
}
