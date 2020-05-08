import {Module} from "@tsed/cli-core";
import {MongooseGenerateHook} from "./hooks/MongooseGenerateHook";
import {MongooseInitHook} from "./hooks/MongooseInitHook";
import {CliMongoose} from "./services/CliMongoose";

@Module({
  imports: [MongooseInitHook, MongooseGenerateHook, CliMongoose]
})
export class CliPluginMongooseModule {}
