import {Interactions, OidcCtx} from "@tsed/oidc-provider";
import {Get, Name} from "@tsed/schema";
import {PathParams} from "@tsed/platform-params";
import {LoginInteraction, ConsentInteraction, CustomInteraction} from "../../interactions/index.js";

@Name("Oidc")
@Interactions({
  path: "/interaction/:uid",
  children: [
    LoginInteraction,
    ConsentInteraction,
    CustomInteraction,
  ]
})
export class InteractionsController {
  @Get("/:name?")
  promptInteraction(@PathParams("name") name: string | undefined, @OidcCtx() oidcCtx: OidcCtx) {
    return oidcCtx.runInteraction();
  }
}
