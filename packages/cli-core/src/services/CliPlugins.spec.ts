import {CliTestContext} from "@tsed/cli-testing";
import {CliPlugins} from "./CliPlugins";
import {NpmRegistryClient} from "./NpmRegistryClient";

describe("CliPlugins", () => {
  beforeEach(() =>
    CliTestContext.create({
      name: "tsed"
    })
  );
  afterEach(CliTestContext.reset);

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
        search: jest.fn().mockReturnValue(Promise.resolve(response))
      };

      const cliPlugins = await CliTestContext.invoke<CliPlugins>(CliPlugins, [
        {
          token: NpmRegistryClient,
          use: npmClient
        }
      ]);

      // WHEN
      const result = await cliPlugins.searchPlugins("@tsed/cli-plugin-mongo");

      // THEN
      expect(npmClient.search).toHaveBeenCalledWith("@tsed/cli-plugin-mongo", {});
      result.should.deep.eq([
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
