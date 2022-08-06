import { PlatformTest } from "@tsed/common";
import { catchAsyncError } from "@tsed/core";
import { BadRequest } from "@tsed/exceptions";

import { Accounts } from "../services/Accounts";
import { getOidcContextFixture } from "./__mock__/oidcContext.fixture";
import { LoginInteraction } from "./LoginInteraction";

async function createInteractionFixture() {
  const accounts = {
    authenticate: jest.fn()
  };

  const interaction = await PlatformTest.invoke<LoginInteraction>(LoginInteraction, [
    {
      token: Accounts,
      use: accounts
    }
  ]);

  return { interaction, accounts };
}

describe("LoginInteraction", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    return PlatformTest.create();
  });
  afterEach(() => PlatformTest.reset());

  describe("$prompt()", () => {
    it("should return the prompt login context", async () => {
      const { interaction } = await createInteractionFixture();
      const oidcContext = getOidcContextFixture();

      const result = await interaction.$prompt(oidcContext);

      expect(oidcContext.checkClientId).toHaveBeenCalledWith();

      expect(result).toEqual({
        client: {
          client_id: "client_id"
        },
        details: {},
        flash: false,
        params: {
          client_id: "client_id"
        },
        title: "Sign-in",
        uid: "uid"
      });
    });
    it("should throw error when the Client is unauthorized", async () => {
      const { interaction } = await createInteractionFixture();
      const oidcContext = getOidcContextFixture();

      (oidcContext.checkClientId as jest.Mock).mockRejectedValue(new Error("Unknown given client_id: client_id"));

      const result = await catchAsyncError(() => interaction.$prompt(oidcContext));

      expect(oidcContext.checkClientId).toHaveBeenCalledWith();
      expect(result?.message).toEqual("Unknown given client_id: client_id");
    });
  });
  describe("submit()", () => {
    it("should find account", async () => {
      const { interaction, accounts } = await createInteractionFixture();
      const oidcContext = getOidcContextFixture();

      const payload = { email: "email@email.com", password: "pwd" };

      accounts.authenticate.mockResolvedValue({
        accountId: "id"
      });

      const result = await interaction.submit(payload, oidcContext);

      expect(result).toEqual(undefined);
      expect(oidcContext.checkInteractionName).toHaveBeenCalledWith("login");
      expect(oidcContext.interactionFinished).toHaveBeenCalledWith({ login: { accountId: "id" } });
    });
    it("should return to the login page and return the right context page", async () => {
      const { interaction, accounts } = await createInteractionFixture();
      const oidcContext = getOidcContextFixture();

      const payload = { email: "email@email.com", password: "pwd" };

      accounts.authenticate.mockResolvedValue(null);

      const result = await interaction.submit(payload, oidcContext);

      expect(result).toEqual({
        client: {
          client_id: "client_id"
        },
        details: {},
        flash: "Invalid email or password.",
        params: {
          client_id: "client_id",
          login_hint: "email@email.com"
        },
        title: "Sign-in",
        uid: "uid"
      });
      expect(oidcContext.checkInteractionName).toHaveBeenCalledWith("login");
      expect(oidcContext.interactionFinished).not.toHaveBeenCalled();
    });
    it("should fail if the prompt name is incorrect", async () => {
      const { interaction } = await createInteractionFixture();
      const oidcContext = getOidcContextFixture();
      oidcContext.prompt.name = "unknown";

      oidcContext.checkInteractionName.mockImplementation(() => {
        throw new BadRequest("Bad interaction name");
      });

      const payload = { email: "email@email.com", password: "pwd" };

      const error = await catchAsyncError<any>(() => interaction.submit(payload, oidcContext));

      expect(oidcContext.checkInteractionName).toHaveBeenCalledWith("login");
      expect(error?.message).toEqual("Bad interaction name");
      expect(error?.status).toEqual(400);
    });
  });
});
