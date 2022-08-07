import {Get} from "@tsed/common";
import {Interactions, OidcCtx} from "@tsed/oidc-provider";
import {Name} from "@tsed/schema";
import * as interactions from "../../interactions/index";

@Name("Oidc")
@Interactions({
  path: "/interaction/:uid",
  children: Object.values(interactions)
})
export class InteractionsController {
  @Get("/")
  async promptInteraction(@OidcCtx() oidcCtx: OidcCtx) {
    return oidcCtx.runInteraction();
  }
}
