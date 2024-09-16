// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliPlugins} from "./CliPlugins.js";
import {NpmRegistryClient} from "./NpmRegistryClient.js";

describe("CliPlugins", () => {
  beforeEach(() =>
    CliPlatformTest.create({
      name: "tsed"
    })
  );
  afterEach(CliPlatformTest.reset);

  describe("searchPlugins()", () => {
    it("should search plugins", async () => {
      // GIVEN
      const response = [
        {
          package: {
            name: "@tsed/cli-plugin-mongoose",
            description: "description"
          }
        },
        {
          package: {
            name: "tsed-cli-plugin-mongoose"
          }
        },
        {
          package: {
            name: "tsed-plugin-other"
          }
        }
      ];
      const npmClient = {
        search: vi.fn().mockReturnValue(Promise.resolve(response))
      };

      const cliPlugins = await CliPlatformTest.invoke<CliPlugins>(CliPlugins, [
        {
          token: NpmRegistryClient,
          use: npmClient
        }
      ]);

      // WHEN
      const result = await cliPlugins.searchPlugins("@tsed/cli-plugin-mongo");

      // THEN
      expect(npmClient.search).toHaveBeenCalledWith("@tsed/cli-plugin-mongo", {});
      expect(result).toEqual([
        {
          name: "@tsed/cli-plugin-mongoose description",
          value: "@tsed/cli-plugin-mongoose"
        },
        {
          name: "tsed-cli-plugin-mongoose",
          value: "tsed-cli-plugin-mongoose"
        }
      ]);
    });
  });
});
