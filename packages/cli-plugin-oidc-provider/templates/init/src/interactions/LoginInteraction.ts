import {BodyParams} from "@tsed/platform-params";
import {Env} from "@tsed/core";
import {Constant, Inject} from "@tsed/di";
import {Interaction, OidcCtx} from "@tsed/oidc-provider";
import {Name, Post, View} from "@tsed/schema";
import {Accounts} from "../services/Accounts.js";

@Interaction({
  name: "login",
  requestable: true
})
@Name("Oidc")
export class LoginInteraction {
  @Constant("env")
  env: Env;

  @Inject()
  accounts: Accounts;

  $onCreate() {}

  @View("login")
  async $prompt(@OidcCtx() oidcCtx: OidcCtx): Promise<any> {
    await oidcCtx.checkClientId();

    return oidcCtx.interactionPrompt({
      title: "Sign-in",
      flash: false
    });
  }

  @Post("/login")
  @View("login")
  async submit(@BodyParams() payload: any, @OidcCtx() oidcCtx: OidcCtx) {
    oidcCtx.checkInteractionName("login");

    const account = await this.accounts.authenticate(payload.email, payload.password);

    if (!account) {
      return oidcCtx.interactionPrompt({
        params: {
          login_hint: payload.email
        },
        title: "Sign-in",
        flash: "Invalid email or password."
      });
    }

    return oidcCtx.interactionFinished({
      login: {
        accountId: account.accountId
      }
    });
  }
}
