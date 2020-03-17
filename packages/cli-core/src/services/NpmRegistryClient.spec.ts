import {CliHttpClient} from "@tsed/cli-core";
import {CliTestContext} from "@tsed/cli-testing";
import * as Sinon from "sinon";
import {NpmRegistryClient} from "./NpmRegistryClient";

const sandbox = Sinon.createSandbox();

describe("NpmRegistryClient", () => {
  beforeEach(CliTestContext.create);
  afterEach(CliTestContext.reset);
  afterEach(() => sandbox.restore());

  describe("search()", () => {
    it("should search packages", async () => {
      // GIVEN
      const httpClient = {
        get: sandbox.stub().resolves({objects: "response"})
      };

      const npmRegistryClient = await CliTestContext.invoke<NpmRegistryClient>(NpmRegistryClient, [
        {
          token: CliHttpClient,
          use: httpClient
        }
      ]);

      // WHEN
      const result = await npmRegistryClient.search("text");

      // THEN
      httpClient.get.should.have.been.calledWithExactly(Sinon.match("-/v1/search"), {
        qs: {
          text: "text",
          from: 0,
          maintenance: 0.5,
          popularity: 0.98,
          quality: 0.65,
          size: 100
        }
      });
      result.should.eq("response");
    });
    it("should search packages with some options", async () => {
      // GIVEN
      const httpClient = {
        get: sandbox.stub().resolves({objects: "response"})
      };

      const npmRegistryClient = await CliTestContext.invoke<NpmRegistryClient>(NpmRegistryClient, [
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
      httpClient.get.should.have.been.calledWithExactly(Sinon.match("-/v1/search"), {
        qs: {
          text: "text",
          from: 1,
          maintenance: 1.5,
          popularity: 1.98,
          quality: 1.65,
          size: 90
        }
      });
      result.should.eq("response");
    });
  });
  describe("info()", () => {
    it("should get package info", async () => {
      // GIVEN
      const httpClient = {
        get: sandbox.stub().resolves("response")
      };

      const npmRegistryClient: NpmRegistryClient = await CliTestContext.invoke<NpmRegistryClient>(NpmRegistryClient, [
        {
          token: CliHttpClient,
          use: httpClient
        }
      ]);

      // WHEN
      const result = await npmRegistryClient.info("@scope/module");

      // THEN
      httpClient.get.should.have.been.calledWithExactly(Sinon.match("%40scope%2Fmodule"));
      result.should.eq("response");
    });
  });
});
