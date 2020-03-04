import {ProvidersInfoService} from "@tsed/cli";
import {expect} from "chai";

describe("ProvidersInfoService", () => {
  it("should add a provider info", () => {
    class Self {}

    const providers = new ProvidersInfoService();

    providers.add(
      {
        name: "Provider",
        value: "provider"
      },
      Self
    );

    expect(providers.get("provider")).to.deep.eq({
      name: "Provider",
      value: "provider",
      owner: "Self"
    });
    expect(providers.toArray()).to.deep.eq([
      {
        name: "Provider",
        value: "provider",
        owner: "Self"
      }
    ]);
  });
});
