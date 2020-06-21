import {ProvidersInfoService} from "./ProvidersInfoService";

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

    expect(providers.get("provider")).toEqual({
      name: "Provider",
      value: "provider",
      owner: "Self"
    });
    expect(providers.toArray()).toEqual([
      {
        name: "Provider",
        value: "provider",
        owner: "Self"
      }
    ]);
  });
});
