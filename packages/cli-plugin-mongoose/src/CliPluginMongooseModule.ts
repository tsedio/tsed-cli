import "./templates/index.js";

import {inject, ProjectPackageJson} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

import {MongooseGenerateHook} from "./hooks/MongooseGenerateHook.js";
import {MongooseInitHook} from "./hooks/MongooseInitHook.js";
import {CliMongoose} from "./services/CliMongoose.js";

export class CliPluginMongooseModule {
  protected packageJson = inject(ProjectPackageJson);

  $onAddPlugin(plugin: string) {
    if (plugin == "@tsed/cli-plugin-mongoose") {
      this.packageJson.addDependencies({
        "@tsed/mongoose": this.packageJson.dependencies["@tsed/platform-http"],
        mongoose: "latest"
      });

      this.packageJson.addDevDependencies({
        "@tsed/testing-mongoose": this.packageJson.dependencies["@tsed/platform-http"]
      });
    }
  }
}

injectable(CliPluginMongooseModule).imports([MongooseInitHook, MongooseGenerateHook, CliMongoose]);
