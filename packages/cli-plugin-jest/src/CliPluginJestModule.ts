// Import templates to register them with the DI container
import "./templates/index.js";

import {RuntimesModule} from "@tsed/cli";
import {inject, ProjectPackageJson} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

import {JestGenerateHook} from "./hooks/JestGenerateHook.js";
import {JestInitHook} from "./hooks/JestInitHook.js";

export class CliPluginJestModule {
  protected runtimes = inject(RuntimesModule);
  protected packageJson = inject(ProjectPackageJson);

  $onAddPlugin(plugin: string) {
    if (plugin === "@tsed/cli-plugin-jest") {
      this.addScripts();
      this.addDevDependencies();
    }
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

injectable(CliPluginJestModule).imports([JestInitHook, JestGenerateHook]);
