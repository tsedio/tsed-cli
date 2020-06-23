import {CliPlatformTest} from "@tsed/cli-testing";
import {CliHttpClient} from "./CliHttpClient";
import {NpmRegistryClient} from "./NpmRegistryClient";

describe("NpmRegistryClient", () => {
  beforeEach(CliPlatformTest.create);
  afterEach(CliPlatformTest.reset);

  describe("search()", () => {
    it("should search packages", async () => {
      // GIVEN
      const httpClient = {
        get: jest.fn().mockReturnValue(Promise.resolve({objects: "response"}))
      };

      const npmRegistryClient = await CliPlatformTest.invoke<NpmRegistryClient>(NpmRegistryClient, [
        {
          token: CliHttpClient,
          use: httpClient
        }
      ]);

      // WHEN
      const result = await npmRegistryClient.search("text");

      // THEN
      expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining("-/v1/search"), {
        qs: {
          text: "text",
          from: 0,
          maintenance: 0.5,
          popularity: 0.98,
          quality: 0.65,
          size: 100
        }
      });
      expect(result).toEqual("response");
    });
    it("should search packages with some options", async () => {
      // GIVEN
      const httpClient = {
        get: jest.fn().mockReturnValue(Promise.resolve({objects: "response"}))
      };

      const npmRegistryClient = await CliPlatformTest.invoke<NpmRegistryClient>(NpmRegistryClient, [
        {
          token: CliHttpClient,
          use: httpClient
        }
      ]);

      // WHEN
      const result = await npmRegistryClient.search("text", {
        from: 1,
        maintenance: 1.5,
        popularity: 1.98,
        quality: 1.65,
        size: 90
      });

      // THEN
      expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining("-/v1/search"), {
        qs: {
          text: "text",
          from: 1,
          maintenance: 1.5,
          popularity: 1.98,
          quality: 1.65,
          size: 90
        }
      });
      expect(result).toEqual("response");
    });
  });
  describe("info()", () => {
    it("should get package info", async () => {
      // GIVEN
      const httpClient = {
        get: jest.fn().mockReturnValue(Promise.resolve("response"))
      };

      const npmRegistryClient: NpmRegistryClient = await CliPlatformTest.invoke<NpmRegistryClient>(NpmRegistryClient, [
        {
          token: CliHttpClient,
          use: httpClient
        }
      ]);

      // WHEN
      const result = await npmRegistryClient.info("@scope/module");

      // THEN
      expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining("@scope%2fmodule"));
      expect(result).toEqual("response");
    });
  });
});
