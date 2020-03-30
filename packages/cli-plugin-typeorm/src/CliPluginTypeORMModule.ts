import {Module} from "@tsed/cli-core";
import {TypeORMCmd} from "./commands/TypeORMCmd";
import {TypeORMInitHook} from "./hooks/TypeORMInitHook";

@Module({
  imports: [TypeORMInitHook, TypeORMCmd]
})
export class CliPluginTypeORMModule {
}
