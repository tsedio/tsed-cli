import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

import {MongooseGenerateHook} from "./hooks/MongooseGenerateHook.js";
import {MongooseInitHook} from "./hooks/MongooseInitHook.js";
import {CliMongoose} from "./services/CliMongoose.js";

@Module({
  imports: [MongooseInitHook, MongooseGenerateHook, CliMongoose]
})
export class CliPluginMongooseModule {
  @Inject()
  packageJson: ProjectPackageJson;

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
