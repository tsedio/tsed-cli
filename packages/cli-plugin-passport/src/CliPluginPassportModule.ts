import {Module} from "@tsed/cli-core";
import {PassportGenerateHook} from "./hooks/PassportGenerateHook";

@Module({
  imports: [PassportGenerateHook]
})
export class CliPluginPassportModule {}
