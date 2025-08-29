import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";
import {kebabCase} from "change-case";

export default defineTemplate({
  id: "protocol.passport-local",
  label: "Passport local Protocol",
  fileName: "{{symbolName}}.protocol",
  outputDir: "{{srcDir}}/protocols",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    const protocolName = kebabCase(data.name);

    return `import {Req} from "@tsed/platform-http";
import {BodyParams} from "@tsed/platform-params";
import {OnInstall, OnVerify, Protocol} from "@tsed/passport";
import {IStrategyOptions, Strategy} from "passport-local";

@Protocol<IStrategyOptions>({
  name: "${protocolName}",
  useStrategy: Strategy,
  settings: {
    usernameField: "email",
    passwordField: "password"
  }
})
export class ${symbolName} implements OnVerify, OnInstall {
  async $onVerify(@Req() request: Req, @BodyParams() credentials: any) {
    const {email, password} = credentials;

  }

  $onInstall(strategy: Strategy): void {
    // intercept the strategy instance to adding extra configuration
  }
}
`;
  }
});
