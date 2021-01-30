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
        headers: {
          Accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
          "Accept-Encoding": "gzip"
        },
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
        headers: {
          Accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
          "Accept-Encoding": "gzip"
        },
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
        get: jest.fn().mockRejectedValueOnce(new Error("Not found")).mockResolvedValueOnce("response")
      };

      const npmRegistryClient: NpmRegistryClient = await CliPlatformTest.invoke<NpmRegistryClient>(NpmRegistryClient, [
        {
          token: CliHttpClient,
          use: httpClient
        }
      ]);

      // WHEN
      const result = await npmRegistryClient.info("@tsed/cli", 5);

      // THEN
      expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining("@tsed/cli"), {
        headers: {
          Accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
          "Accept-Encoding": "gzip"
        },
        retry: 5,
        unfiltered: false
      });

      expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining("@tsed%2fcli"), {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip"
        },
        retry: 4,
        unfiltered: true
      });

      expect(result).toEqual("response");
    });
  });
});
