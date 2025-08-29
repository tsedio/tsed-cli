import {Get, PathParams} from "@tsed/platform-http";
import {Interactions, OidcCtx} from "@tsed/oidc-provider";
import {Name} from "@tsed/schema";
import * as interactions from "../../interactions/index.js";

@Name("Oidc")
@Interactions({
  path: "/interaction/:uid",
  children: Object.values(interactions)
})
export class InteractionsController {
  @Get("/:name?")
  promptInteraction(@PathParams("name") name: string | undefined, @OidcCtx() oidcCtx: OidcCtx) {
    return oidcCtx.runInteraction();
  }
}
