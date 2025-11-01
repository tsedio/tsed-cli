import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";
import {kebabCase} from "change-case";

export default defineTemplate({
  id: "protocol.passport-discord",
  label: "Passport Discord Protocol",
  fileName: "{{symbolName}}.protocol",
  outputDir: "{{srcDir}}/protocols",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    const protocolName = kebabCase(data.name);

    return `import {Args, OnInstall, OnVerify, Protocol} from "@tsed/passport";
import {Req} from "@tsed/platform-http";
import {Strategy, StrategyOptions} from "passport-discord";
import * as refresh from "passport-oauth2-refresh";

@Protocol<StrategyOptions>({
  name: "${protocolName}",
  useStrategy: Strategy,
  settings: {
    clientID: "id",
    clientSecret: "secret",
    callbackURL: "callbackURL"
  }
})
export class ${symbolName} implements OnVerify, OnInstall {
  async $onVerify(@Req() req: Req, @Args() [accessToken, refreshToken, profile]: any) {
    profile.refreshToken = refreshToken;

    // const user = await this.authService.findOne({discordId: profile.id});

    // return user ? user : false;
  }

  async $onInstall(strategy: Strategy) {
    refresh.use(strategy);
  }
}`;
  }
});
