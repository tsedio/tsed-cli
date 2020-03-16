import {CliTestContext} from "@tsed/cli-testing";
import * as Sinon from "sinon";
import {CliPlugins} from "./CliPlugins";
import {NpmRegistryClient} from "./NpmRegistryClient";

const sandbox = Sinon.createSandbox();

describe("CliPlugins", () => {
  beforeEach(() =>
    CliTestContext.create({
      name: "tsed"
    })
  );
  afterEach(CliTestContext.reset);
  afterEach(() => sandbox.restore());

  describe("searchPlugins()", () => {
    it("should search plugins", async () => {
      // GIVEN
      const npmClient = {
        search: sandbox.stub().resolves([
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
        ])
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
      npmClient.search.should.have.been.calledWithExactly("@tsed/cli-plugin-mongo", {});
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
