import {defineTemplate, type RenderDataContext} from "@tsed/cli";

declare global {
  namespace TsED {
    interface RenderDataContext {
      oidcBasePath?: string;
    }
  }
}

export default defineTemplate({
  id: "oidc-provider.index",
  label: "OIDC Provider Index",
  fileName: "index",
  outputDir: "{{srcDir}}/config/oidc",
  hidden: true,

  render(_, data: RenderDataContext) {
    return `import {OidcSettings} from "@tsed/oidc-provider";
import {Accounts} from "../../services/Accounts.js";

const settings: OidcSettings = {
  path: "${data.oidcBasePath}",
  Accounts: Accounts,
  jwksPath: "./jwks.jon",
  clients: [
    {
      client_id: "client_id",
      client_secret: "client_secret",
      redirect_uris: [
        "http://localhost:3000"
      ],
      response_types: ["id_token"],
      grant_types: ["implicit"],
      token_endpoint_auth_method: "none"
    }
  ],
  claims: {
    openid: ["sub"],
    email: ["email", "email_verified"]
  },
  features: {
    // disable the packaged interactions
    devInteractions: {enabled: false},
    encryption: {enabled: true},
    introspection: {enabled: true},
    revocation: {enabled: true}
  }
}

export default settings`;
  }
});
