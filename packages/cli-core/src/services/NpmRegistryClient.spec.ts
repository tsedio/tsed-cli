// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import getAuthToken from "registry-auth-token";
import registry_url from "registry-url";

import {CliHttpClient} from "./CliHttpClient.js";
import {NpmRegistryClient} from "./NpmRegistryClient.js";

vi.mock("registry-url");
vi.mock("registry-auth-token");

describe("NpmRegistryClient", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("with default registry", () => {
    const host = "https://registry.npmjs.org";

    beforeEach(() => {
      vi.mocked(registry_url).mockReturnValue(host);
      vi.mocked(getAuthToken).mockReturnValue(undefined);
    });

    describe("search()", () => {
      it("should search packages", async () => {
        // GIVEN
        const httpClient = {
          get: vi.fn().mockReturnValue(Promise.resolve({objects: "response"}))
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
        expect(httpClient.get).toHaveBeenCalledWith(`${host}/-/v1/search`, {
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
          get: vi.fn().mockReturnValue(Promise.resolve({objects: "response"}))
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
        expect(httpClient.get).toHaveBeenCalledWith(`${host}/-/v1/search`, {
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
          get: vi.fn().mockRejectedValueOnce(new Error("Not found")).mockResolvedValueOnce("response")
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
        expect(httpClient.get).toHaveBeenCalledWith(`${host}/@tsed/cli`, {
          headers: {
            Accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
            "Accept-Encoding": "gzip"
          },
          retry: 5,
          unfiltered: false
        });

        expect(httpClient.get).toHaveBeenCalledWith(`${host}/@tsed%2fcli`, {
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

  describe("with private registry", () => {
    const host = "https://my-registry.com/npm/packages";

    beforeEach(() => {
      vi.mocked(registry_url).mockReturnValue(host);
      vi.mocked(getAuthToken).mockReturnValue({type: "Bearer", token: "my-auth-token"});
    });

    describe("search()", () => {
      it("should search packages", async () => {
        // GIVEN
        const httpClient = {
          get: vi.fn().mockReturnValue(Promise.resolve({objects: "response"}))
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
        expect(httpClient.get).toHaveBeenCalledWith(`${host}/-/v1/search`, {
          headers: {
            Accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
            "Accept-Encoding": "gzip",
            Authorization: "Bearer my-auth-token"
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
          get: vi.fn().mockReturnValue(Promise.resolve({objects: "response"}))
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
        expect(httpClient.get).toHaveBeenCalledWith(`${host}/-/v1/search`, {
          headers: {
            Accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
            "Accept-Encoding": "gzip",
            Authorization: "Bearer my-auth-token"
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
          get: vi.fn().mockRejectedValueOnce(new Error("Not found")).mockResolvedValueOnce("response")
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
        expect(httpClient.get).toHaveBeenCalledWith(`${host}/@tsed/cli`, {
          headers: {
            Accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
            "Accept-Encoding": "gzip",
            Authorization: "Bearer my-auth-token"
          },
          retry: 5,
          unfiltered: false
        });

        expect(httpClient.get).toHaveBeenCalledWith(`${host}/@tsed%2fcli`, {
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            Authorization: "Bearer my-auth-token"
          },
          retry: 4,
          unfiltered: true
        });

        expect(result).toEqual("response");
      });
    });
  });
});
