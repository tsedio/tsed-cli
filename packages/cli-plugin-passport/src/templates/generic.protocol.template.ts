import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";
import {kebabCase} from "change-case";

export default defineTemplate({
  id: "protocol.generic",
  label: "Passport Protocol",
  fileName: "{{symbolName}}.protocol",
  outputDir: "{{srcDir}}/protocols",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    const protocolName = kebabCase(data.name);
    const {passportPackage} = data;

    return `import {Req} from "@tsed/platform-http";
import {BodyParams} from "@tsed/platform-params";
import {OnInstall, OnVerify, Protocol, Args} from "@tsed/passport";
import {Strategy} from "${passportPackage}";

@Protocol({
  name: "${protocolName}",
  useStrategy: Strategy,
  settings: {}
})
export class ${symbolName} implements OnVerify, OnInstall {
  async $onVerify(@Req() request: Req, @Args() args: any[]) {
    const [] = args;

  }

  $onInstall(strategy: Strategy): void {
    // intercept the strategy instance to adding extra configuration
  }
}
`;
  }
});
