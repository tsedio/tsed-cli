import {ProvidersInfoService} from "@tsed/cli";
import {RenderService} from "@tsed/cli-core";
import {CliTestContext} from "@tsed/cli-testing";
import {expect} from "chai";
import * as Sinon from "sinon";
import {GenerateCmd} from "./GenerateCmd";

describe("GenerateCmd", () => {
  beforeEach(CliTestContext.create);
  afterEach(CliTestContext.reset);

  describe("$prompt", () => {
    it(
      "should return prompts dialog",
      CliTestContext.inject(
        [GenerateCmd, ProvidersInfoService],
        async (command: GenerateCmd, providersInfoService: ProvidersInfoService) => {
          // GIVEN
          const options = {};

          // WHEN
          const result: any[] = (await command.$prompt(options)) as any[];

          // THEN
          expect(result[0]).to.deep.includes({
            choices: providersInfoService.toArray(),
            default: undefined,
            message: "Which type of provider ?",
            name: "type",
            type: "list",
            when: true
          });
          expect(result[1].message).to.deep.equal("Which name ?");
          expect(result[1].default({type: "name"})).to.deep.equal("Name");
          expect(result[1].when).to.deep.equal(true);
          expect(result[2].message).to.deep.equal("Which route ?");
          expect(result[2].when({type: "controller"})).to.deep.equal(true);
          expect(result[2].when({type: "server"})).to.deep.equal(true);
          expect(result[2].when({type: "pipe"})).to.deep.equal(false);
          expect(result[2].default({type: "server"})).to.deep.equal("/rest");
          expect(result[2].default({type: "other", name: "test"})).to.deep.equal("/test");
        }
      )
    );
    it(
      "should return prompts dialog (with initial options)",
      CliTestContext.inject(
        [GenerateCmd, ProvidersInfoService],
        async (command: GenerateCmd, providersInfoService: ProvidersInfoService) => {
          // GIVEN
          const options = {
            type: "controller",
            name: "Name"
          };

          // WHEN
          const result: any[] = (await command.$prompt(options)) as any[];

          // THEN
          expect(result[0]).to.deep.includes({
            choices: providersInfoService.toArray(),
            default: "controller",
            message: "Which type of provider ?",
            name: "type",
            type: "list",
            when: false
          });
          expect(result[1].message).to.deep.equal("Which name ?");
          expect(result[1].default({type: "name"})).to.deep.equal("Name");
          expect(result[1].when).to.deep.equal(false);
          expect(result[2].message).to.deep.equal("Which route ?");
          expect(result[2].when({type: "controller"})).to.deep.equal(true);
          expect(result[2].when({type: "server"})).to.deep.equal(true);
          expect(result[2].when({type: "pipe"})).to.deep.equal(false);
          expect(result[2].default({type: "server"})).to.deep.equal("/rest");
          expect(result[2].default({type: "other", name: "test"})).to.deep.equal("/test");
        }
      )
    );
  });
  describe("$exec", () => {
    it("should return tasks", async () => {
      // GIVEN
      const renderService = {
        render: Sinon.stub()
      };

      const options = {
        type: "controller",
        name: "test",
        route: "/test"
      };

      const command = await CliTestContext.invoke<GenerateCmd>(GenerateCmd, [
        {
          token: RenderService,
          use: renderService
        }
      ]);

      // WHEN
      const tasks = await command.$exec(options);

      // THEN
      expect(tasks.length).to.equal(1);
      expect(tasks[0].title).to.equal("Generate controller file to 'controllers/TestController.ts'");

      await tasks[0].task();

      renderService.render.should.have.been.calledWithExactly(
        "generate/controller.hbs",
        {
          className: "TestController",
          route: "/test"
        },
        "controllers/TestController.ts"
      );
    });
    it("should return empty tasks", async () => {
      // GIVEN
      const renderService = {
        render: Sinon.stub()
      };

      const options = {
        type: "controller",
        name: "test",
        route: "/test"
      };

      const command = await CliTestContext.invoke<GenerateCmd>(GenerateCmd, [
        {
          token: RenderService,
          use: renderService
        }
      ]);

      // WHEN
      const tasks = await command.$exec(options);

      // THEN
      expect(tasks.length).to.equal(1);
      expect(tasks[0].title).to.equal("Generate controller file to 'controllers/TestController.ts'");

      await tasks[0].task();

      renderService.render.should.have.been.calledWithExactly(
        "generate/controller.hbs",
        {
          className: "TestController",
          route: "/test"
        },
        "controllers/TestController.ts"
      );
    });
  });
});
