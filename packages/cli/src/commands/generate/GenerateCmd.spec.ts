// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {SrcRendererService} from "../../services/Renderer.js";
import {GenerateCmd} from "./GenerateCmd.js";

describe("GenerateCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("$prompt", () => {
    it("should return prompts dialog", async () => {
      const command = await CliPlatformTest.invoke(GenerateCmd);
      // GIVEN
      const options = {};

      // WHEN
      const result: any[] = (await command.$prompt(options)) as any[];

      // THEN
      expect(result[0]).toEqual({
        default: undefined,
        message: "Which type of provider?",
        name: "type",
        source: expect.any(Function),
        type: "autocomplete",
        when: expect.any(Function)
      });
      expect(result[1].message).toEqual("Which name?");
      expect(result[1].default({type: "name"})).toEqual("Name");
      expect(result[1].when).toEqual(true);
      expect(result[3].message).toEqual("Which route?");
      expect(result[3].when({type: "controller"})).toEqual(true);
      expect(result[3].when({type: "server"})).toEqual(true);
      expect(result[3].when({type: "pipe"})).toEqual(false);
      expect(result[3].default({type: "server"})).toEqual("/rest");
      expect(result[3].default({type: "other", name: "test"})).toEqual("/test");
    });
    it("should return prompts dialog (with initial options)", async () => {
      const command = await CliPlatformTest.invoke(GenerateCmd);
      // GIVEN
      const options = {
        type: "controller",
        name: "Name"
      };

      // WHEN
      const result: any[] = (await command.$prompt(options)) as any[];

      // THEN
      expect(result[0]).toEqual({
        default: "controller",
        message: "Which type of provider?",
        source: expect.any(Function),
        name: "type",
        type: "autocomplete",
        when: expect.any(Function)
      });
      expect(result[1].message).toEqual("Which name?");
      expect(result[1].default({type: "name"})).toEqual("Name");
      expect(result[1].when).toEqual(false);
      expect(result[3].message).toEqual("Which route?");
      expect(result[3].when({type: "controller"})).toEqual(true);
      expect(result[3].when({type: "server"})).toEqual(true);
      expect(result[3].when({type: "pipe"})).toEqual(false);
      expect(result[3].default({type: "server"})).toEqual("/rest");
      expect(result[3].default({type: "other", name: "test"})).toEqual("/name");
    });
  });
  describe("$exec", () => {
    it("should return tasks", async () => {
      // GIVEN
      const renderService = {
        render: vi.fn()
      };

      let options = {
        type: "controller",
        name: "test",
        route: "/test"
      };

      const command = await CliPlatformTest.invoke<GenerateCmd>(GenerateCmd, [
        {
          token: SrcRendererService,
          use: renderService
        }
      ]);

      // WHEN
      options = command.$mapContext(options);
      const tasks = await command.$exec(options as any);

      // THEN
      expect(tasks.length).toEqual(2);
      expect(tasks[0].title).toEqual("Generate controller file to 'controllers/Test.ts'");

      await tasks[0].task();

      expect(renderService.render).toHaveBeenCalledWith(
        "generate/controller.hbs",
        {
          name: "test",
          route: "/test",
          symbolName: "Test",
          symbolParamName: "test",
          symbolPath: "controllers/Test",
          symbolPathBasename: "Test",
          type: "controller",
          express: false,
          fastify: false,
          koa: false,
          platformSymbol: undefined,
          barrels: '["./src/controllers/rest"]',
          imports: [
            {
              from: "@tsed/platform-log-request",
              comment: " // remove this import if you don't want log request"
            },
            {from: "@tsed/ajv"},
            {symbols: "{config}", from: "./config/index.js"},
            {symbols: "* as rest", from: "./controllers/rest/index.js"}
          ]
        },
        {
          output: "controllers/Test.ts"
        }
      );
    });
    it("should return empty tasks", async () => {
      // GIVEN
      const renderService = {
        render: vi.fn()
      };

      let options = {
        type: "controller",
        name: "test",
        route: "/test"
      };

      const command = await CliPlatformTest.invoke<GenerateCmd>(GenerateCmd, [
        {
          token: SrcRendererService,
          use: renderService
        }
      ]);

      // WHEN
      options = command.$mapContext(options);
      const tasks = await command.$exec(options as any);

      // THEN
      expect(tasks.length).toEqual(2);
      expect(tasks[0].title).toEqual("Generate controller file to 'controllers/Test.ts'");

      await tasks[0].task();

      expect(renderService.render).toHaveBeenCalledWith(
        "generate/controller.hbs",
        {
          name: "test",
          route: "/test",
          symbolName: "Test",
          symbolParamName: "test",
          symbolPath: "controllers/Test",
          symbolPathBasename: "Test",
          type: "controller",
          express: false,
          koa: false,
          fastify: false,
          platformSymbol: undefined,
          barrels: '["./src/controllers/rest"]',
          imports: [
            {
              from: "@tsed/platform-log-request",
              comment: " // remove this import if you don't want log request"
            },
            {from: "@tsed/ajv"},
            {symbols: "{config}", from: "./config/index.js"},
            {symbols: "* as rest", from: "./controllers/rest/index.js"}
          ]
        },
        {
          output: "controllers/Test.ts"
        }
      );
    });
  });
});
