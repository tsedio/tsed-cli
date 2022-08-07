import { PlatformTest } from "@tsed/common";

import { getOidcContextFixture } from "./__mock__/oidcContext.fixture";
import { ConsentInteraction } from "./ConsentInteraction";

async function createInteractionFixture() {
  const interaction = await PlatformTest.invoke<ConsentInteraction>(ConsentInteraction, []);

  return { interaction };
}

describe("ConsentInteraction", () => {
  beforeEach(() => PlatformTest.create());
  afterEach(() => PlatformTest.reset());

  describe("$prompt()", () => {
    it("should return consent context", async () => {
      const { interaction } = await createInteractionFixture();
      const oidcContext = getOidcContextFixture();

      const result = await interaction.$prompt(oidcContext);

      expect(result).toEqual({
        client: {
          client_id: "client_id"
        },
        flash: false,
        details: {},
        params: {
          client_id: "client_id"
        },
        title: "Authorize",
        uid: "uid"
      });
    });
  });
  describe("confirm()", () => {
    it("should control all consentement", async () => {
      const { interaction } = await createInteractionFixture();
      const oidcContext = getOidcContextFixture();
      oidcContext.prompt.name = "consent";

      const grant = {
        save: jest.fn().mockResolvedValue("grantId"),
        addOIDCScope: jest.fn(),
        addOIDCClaims: jest.fn(),
        addResourceScope: jest.fn()
      };

      oidcContext.getGrant.mockResolvedValue(grant);
      oidcContext.prompt.details = {
        missingOIDCScope: ["scope1", "scope2"],
        missingOIDClaims: ["claims"],
        missingResourceScopes: {
          indicator: ["scopes"]
        }
      };

      const result = await interaction.confirm(oidcContext);

      expect(result).toEqual(undefined);

      expect(oidcContext.getGrant).toHaveBeenCalledWith();
      expect(grant.addOIDCScope).toHaveBeenCalledWith("scope1 scope2");
      expect(grant.addOIDCClaims).toHaveBeenCalledWith(["claims"]);
      expect(grant.addResourceScope).toHaveBeenCalledWith("indicator", "scopes");
      expect(grant.save).toHaveBeenCalledWith();
      expect(oidcContext.interactionFinished).toHaveBeenCalledWith({ consent: { grantId: "grantId" } }, { mergeWithLastSubmission: true });
    });
  });
});
