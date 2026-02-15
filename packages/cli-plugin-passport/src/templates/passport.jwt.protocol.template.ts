import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";
import {kebabCase} from "change-case";

export default defineTemplate({
  id: "protocol.passport-jwt",
  label: "Passport JWT Protocol",
  fileName: "{{symbolName}}.protocol",
  outputDir: "{{srcDir}}/protocols",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    const protocolName = kebabCase(data.name);

    return `import {Arg, OnVerify, Protocol} from "@tsed/passport";
import {Req} from "@tsed/platform-http";
import {ExtractJwt, Strategy, StrategyOptions} from "passport-jwt";

@Protocol<StrategyOptions>({
  name: "${protocolName}",
  useStrategy: Strategy,
  settings: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "secret",
    issuer: "accounts.examplesoft.com",
    audience: "yoursite.net"
  }
})
export class ${symbolName} implements OnVerify {
  async $onVerify(@Req() req: Req, @Arg(0) jwtPayload: {sub: string}) {
    const token = jwtPayload.sub;
    
  }
}
`;
  }
});
