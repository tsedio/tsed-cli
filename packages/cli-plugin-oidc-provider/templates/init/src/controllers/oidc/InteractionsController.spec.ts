import { PlatformTest } from "@tsed/common";

import { getOidcContextFixture } from "../../interactions/__mock__/oidcContext.fixture";
import { InteractionsController } from "./InteractionsController";

describe("InteractionsController", () => {
  beforeEach(() => PlatformTest.create());
  afterEach(() => PlatformTest.reset());

  describe("promptInteraction()", () => {
    it("should run the asked prompt interaction", async () => {
      const oidcContext = getOidcContextFixture();
      const controller = await PlatformTest.invoke<InteractionsController>(InteractionsController);

      await controller.promptInteraction("name", oidcContext);

      expect(oidcContext.runInteraction).toHaveBeenCalledWith("name");
    });
  });
});
