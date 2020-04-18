import {CliPluginMongooseModule} from "./CliPluginMongooseModule";

export * from "./hooks/MongooseInitHook";
export * from "./hooks/MongooseGenerateHook";
export * from "./services/CliMongoose";

export default CliPluginMongooseModule;
