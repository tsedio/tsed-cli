import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";
import {kebabCase} from "change-case";

export default defineTemplate({
  id: "protocol.passport-facebook",
  label: "Passport Facebook Protocol",
  fileName: "{{symbolName}}.protocol",
  outputDir: "{{srcDir}}/protocols",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    const protocolName = kebabCase(data.name);

    return `import {Args, OnInstall, OnVerify, Protocol} from "@tsed/passport";
import {Req} from "@tsed/platform-http";
import {Strategy, StrategyOptions} from "passport-facebook";

import {AuthService} from "../services/auth/AuthService";

@Protocol<StrategyOptions>({
  name: "${protocolName}",
  useStrategy: Strategy,
  settings: {
    clientID: "FACEBOOK_APP_ID",
    clientSecret: "FACEBOOK_APP_SECRET",
    callbackURL: "http://www.example.com/auth/facebook/callback",
    profileFields: ["id", "emails", "name"]
  }
})
export class ${symbolName} implements OnVerify, OnInstall {
  async $onVerify(@Req() req: Req, @Args() [accessToken, refreshToken, profile]: any) {
    profile.refreshToken = refreshToken;

    // const user = await this.authService.findOne({facebookId: profile.id});

    // return user ? user : false;
  }
}`;
  }
});
