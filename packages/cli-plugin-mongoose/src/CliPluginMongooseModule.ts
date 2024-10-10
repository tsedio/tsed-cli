import {inject, Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";

import {MongooseGenerateHook} from "./hooks/MongooseGenerateHook.js";
import {MongooseInitHook} from "./hooks/MongooseInitHook.js";
import {CliMongoose} from "./services/CliMongoose.js";

@Module({
  imports: [MongooseInitHook, MongooseGenerateHook, CliMongoose]
})
export class CliPluginMongooseModule {
  protected packageJson = inject(ProjectPackageJson);

  @OnAdd("@tsed/cli-plugin-mongoose")
  install() {
    this.packageJson.addDependencies({
      "@tsed/mongoose": this.packageJson.dependencies["@tsed/common"],
      mongoose: "latest"
    });

    this.packageJson.addDevDependencies({
      "@tsed/testing-mongoose": this.packageJson.dependencies["@tsed/common"]
    });
  }
}
