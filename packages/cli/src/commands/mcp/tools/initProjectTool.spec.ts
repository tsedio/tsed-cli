import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {DITest, injector} from "@tsed/di";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {CliTemplatesService} from "../../../services/CliTemplatesService.js";
import {InitMCPSchema} from "../schema/InitMCPSchema.js";
import {initProjectTool} from "./initProjectTool.js";

describe("initProjectTool", () => {
  let cliService: {exec: ReturnType<typeof vi.fn>};
  let projectPackage: any;
  let templates: {getRenderedFiles: ReturnType<typeof vi.fn>};

  const createProjectPackage = (overrides: any = {}) => {
    const state = {
      cwd: ".",
      name: "tsed-app",
      preferences: {
        platform: "express",
        packageManager: undefined
      },
      setCWD: vi.fn((dir: string) => {
        state.cwd = dir;
      }),
      $loadPackageJson: vi.fn()
    };

    return Object.assign(state, overrides);
  };

  beforeEach(() => {
    DITest.create({env: "test"});

    cliService = {
      exec: vi.fn().mockResolvedValue(undefined)
    };
    projectPackage = createProjectPackage();
    templates = {
      getRenderedFiles: vi.fn().mockReturnValue([]),
      $onInit: vi.fn()
    } as any;

    injector()
      .addProvider(CliService, {
        useValue: cliService
      })
      .addProvider(ProjectPackageJson, {
        useValue: projectPackage
      })
      .addProvider(CliTemplatesService, {
        useValue: templates
      });
  });
  afterEach(() => DITest.reset());

  it("should expose metadata that requires cwd and references init options resource", () => {
    const instance = injector().invoke(initProjectTool);
    const jsonSchema = InitMCPSchema().toJSON();

    expect(instance.description).toContain("tsed://init/options");
    expect(instance.inputSchema).toBeDefined();
    expect(jsonSchema.properties?.cwd).toBeDefined();
    expect(jsonSchema.properties?.cwd?.description).toContain("Current working directory");
  });

  it("should prevent re-initializing an existing project", async () => {
    const instance = injector().invoke(initProjectTool);
    projectPackage.preferences.packageManager = "pnpm";

    const result = await instance.handler({cwd: "/project"} as any, {} as any);

    expect(projectPackage.setCWD).toHaveBeenCalledWith("/project");
    expect(cliService.exec).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      isError: true,
      structuredContent: {
        code: "E_PROJECT_ALREADY_INITIALIZED"
      }
    });
  });

  it("should run the init command and return structured output", async () => {
    const instance = injector().invoke(initProjectTool);
    const files = [{outputPath: "src/index.ts"}, {outputPath: "src/app.ts"}];
    templates.getRenderedFiles.mockReturnValue(files);
    projectPackage.preferences.platform = "koa";

    const result = await instance.handler({cwd: "/workspace", platform: "koa"} as any, {} as any);

    expect(projectPackage.setCWD).toHaveBeenCalledWith("/workspace");
    expect(cliService.exec).toHaveBeenCalledWith(
      "init",
      expect.objectContaining({
        cwd: "/workspace",
        platform: "koa",
        skipPrompt: true
      }),
      expect.anything()
    );
    expect(result.structuredContent).toEqual({
      files: ["src/index.ts", "src/app.ts"],
      count: 2,
      projectName: projectPackage.name,
      cwd: "/workspace",
      logs: ["init:root:/workspace", "init:platform:koa", "files:2"],
      warnings: undefined
    });
  });
});
