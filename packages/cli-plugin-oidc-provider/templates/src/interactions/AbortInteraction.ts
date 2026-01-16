import {Inject} from "@tsed/platform-http";
import {Interaction, OidcCtx, OidcProvider, InteractionMethods} from "@tsed/oidc-provider";
import {View, Name} from "@tsed/schema";

@Interaction({
  name: "abort"
})
@Name("Oidc")
export class AbortInteraction implements InteractionMethods {
  @Inject()
  oidc: OidcProvider;

  @View("interaction")
  $prompt(@OidcCtx() oidcCtx: OidcCtx): Promise<any> {
    return oidcCtx.interactionFinished(
      {
        error: "access_denied",
        error_description: "End-User aborted interaction"
      },
      {
        mergeWithLastSubmission: false
      }
    );
  }
}
