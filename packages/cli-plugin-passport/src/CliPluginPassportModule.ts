import {IGenerateCmdContext} from "@tsed/cli";
import {Module} from "@tsed/cli-core";
import {resolve} from "path";
import {PassportGenerateHook} from "./hooks/PassportGenerateHook";

const TEMPLATE_DIR = resolve(__dirname, "..", "templates");

export interface IPassportGenerationOptions extends IGenerateCmdContext {
  passportPackage: string;
}

@Module({
  imports: [PassportGenerateHook]
})
export class CliPluginPassportModule {}
