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
    debug: jest.fn(),
    findAccount: jest.fn(),
    findClient: jest.fn(),
    getGrant: jest.fn(),
    grantId: undefined,
    checkInteractionName: jest.fn(),
    checkClientId: jest.fn(),
    interactionDetails: jest.fn().mockResolvedValue({}),
    interactionFinished: jest.fn().mockResolvedValue(undefined),
    interactionResult: jest.fn().mockResolvedValue(""),
    interactionPrompt: jest.fn().mockImplementation((obj) => {
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
    render: jest.fn(),
    runInteraction: jest.fn(),
    save: jest.fn(),
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
