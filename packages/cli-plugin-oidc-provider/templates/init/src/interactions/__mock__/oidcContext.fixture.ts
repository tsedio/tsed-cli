import { OidcInteractionContext } from "@tsed/oidc-provider";
import { PromptDetail } from "oidc-provider";

export function getPromptDetailFixture(opts: Partial<PromptDetail> = {}): PromptDetail {
  return {
    details: {},
    name: "login",
    reasons: [],
    ...opts
  };
}

export function getOidcContextFixture(opts: Partial<OidcInteractionContext> = {}) {
  const p = {
    context: undefined,
    env: undefined,
    oidcInteractions: undefined,
    oidcProvider: undefined,
    raw: undefined,
    debug: vi.fn(),
    findAccount: vi.fn(),
    findClient: vi.fn(),
    getGrant: vi.fn(),
    grantId: undefined,
    checkInteractionName: vi.fn(),
    checkClientId: vi.fn(),
    interactionDetails: vi.fn().mockResolvedValue({}),
    interactionFinished: vi.fn().mockResolvedValue(undefined),
    interactionResult: vi.fn().mockResolvedValue(""),
    interactionPrompt: vi.fn().mockImplementation((obj) => {
      return {
        client: {
          client_id: "client_id"
        },
        ...obj,
        details: p.prompt.details,
        uid: p.uid,
        params: {
          ...p.params,
          ...(obj.params || {})
        }
      };
    }),
    render: vi.fn(),
    runInteraction: vi.fn(),
    save: vi.fn(),
    session: {},
    params: {
      client_id: "client_id"
    },
    uid: "uid",
    ...opts,
    prompt: getPromptDetailFixture(opts.prompt)
  } as any;

  return p;
}
