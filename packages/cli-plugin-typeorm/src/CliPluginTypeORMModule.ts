import {Module} from "@tsed/cli-core";
import {TypeORMCmd} from "./commands/TypeORMCmd";
import {TypeORMGenerateHook} from "./hooks/TypeORMGenerateHook";
import {TypeORMInitHook} from "./hooks/TypeORMInitHook";

@Module({
  imports: [TypeORMInitHook, TypeORMGenerateHook, TypeORMCmd]
})
export class CliPluginTypeORMModule {
}
