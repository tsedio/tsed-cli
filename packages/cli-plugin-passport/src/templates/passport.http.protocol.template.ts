import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";
import {kebabCase} from "change-case";

export default defineTemplate({
  id: "protocol.passport-http",
  label: "Passport HTTP Protocol",
  fileName: "{{symbolName}}.protocol",
  outputDir: "{{srcDir}}/protocols",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    const protocolName = kebabCase(data.name);

    return `import {Req} from "@tsed/platform-http";
import {BodyParams} from "@tsed/platform-params";
import {OnInstall, OnVerify, Protocol} from "@tsed/passport";
import {BasicStrategy} from "passport-http";

@Protocol({
  name: "${protocolName}",
  useStrategy: BasicStrategy,
  settings: {}
})
export class ${symbolName} implements OnVerify, OnInstall {
  async $onVerify(@Req() request: Req, @BodyParams() credentials: any) {
    const {username, password} = credentials;

  }

  $onInstall(strategy: Strategy): void {
    // intercept the strategy instance to adding extra configuration
  }
}
`;
  }
});
