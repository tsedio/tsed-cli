import {ProvidersInfoService} from "./ProvidersInfoService";

describe("ProvidersInfoService", () => {
  describe("add()", () => {
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

  describe("findProviders()", () => {
    function createServiceFixture() {
      const service = new ProvidersInfoService();

      service.add({
        name: "Provider",
        value: "provider"
      });

      service.add({
        name: "Service",
        value: "service"
      });

      return service;
    }

    it("should propose the exact match", () => {
      const service = createServiceFixture();

      expect(service.findProviders("provider")).toEqual([
        {
          name: "Provider",
          owner: "undefined",
          value: "provider"
        }
      ]);
      expect(service.findProviders("Provider")).toEqual([
        {
          name: "Provider",
          owner: "undefined",
          value: "provider"
        }
      ]);
    });

    it("should return all providers when type is undefined", () => {
      const service = createServiceFixture();

      service.add({
        name: "Provider",
        value: "provider"
      });

      expect(service.findProviders(undefined)).toEqual([
        {
          name: "Provider",
          owner: "undefined",
          value: "provider"
        },
        {
          name: "Service",
          owner: "undefined",
          value: "service"
        }
      ]);
    });

    it("should return all providers when type doesn't match", () => {
      const service = createServiceFixture();

      expect(service.findProviders("unknown")).toEqual([
        {
          name: "Provider",
          owner: "undefined",
          value: "provider"
        },
        {
          name: "Service",
          owner: "undefined",
          value: "service"
        }
      ]);
    });

    it("should return the all providers which includes term", () => {
      const service = createServiceFixture();

      service.add({
        name: "Custom Provider",
        value: "custom:provider"
      });

      expect(service.findProviders("provi")).toEqual([
        {
          name: "Provider",
          owner: "undefined",
          value: "provider"
        },
        {
          name: "Custom Provider",
          owner: "undefined",
          value: "custom:provider"
        }
      ]);
    });
  });
});
