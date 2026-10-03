import {CliFs, ProjectPackageJson} from "@tsed/cli-core";
import {DITest, injector} from "@tsed/di";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {setWorkspaceTool} from "./setWorkspaceTool.js";

describe("setWorkspaceTool", () => {
  let fs: {exists: ReturnType<typeof vi.fn>};
  let projectPackage: any;

  beforeEach(() => {
    DITest.create({env: "test"});

    fs = {
      exists: vi.fn().mockReturnValue(true)
    };
    projectPackage = {
      cwd: "/project",
      preferences: {
        convention: "conv_default",
        packageManager: "yarn",
        platform: "express",
        runtime: "node"
      },
      setCWD: vi.fn(),
      toJSON: vi.fn().mockReturnValue({name: "tsed-app"})
    };

    injector()
      .addProvider(CliFs, {
        useValue: fs
      })
      .addProvider(ProjectPackageJson, {
        useValue: projectPackage
      });
  });
  afterEach(() => DITest.reset());

  it("should return a structured content that matches the declared output schema", async () => {
    const instance = injector().invoke(setWorkspaceTool);

    const result: any = await instance.handler({cwd: "/project"} as any, {} as any);
    const outputSchema = (instance.outputSchema as any)["~standard"].jsonSchema.output({target: "draft-2020-12"});
    const declared = Object.keys(outputSchema.properties);

    expect(projectPackage.setCWD).toHaveBeenCalledWith("/project");
    expect(result.structuredContent).toEqual({
      cwd: "/project",
      pkg: {name: "tsed-app"},
      preferences: {
        convention: "conv_default",
        packageManager: "yarn",
        platform: "express",
        runtime: "node"
      }
    });
    expect(Object.keys(result.structuredContent).every((key) => declared.includes(key))).toBe(true);
  });

  it("should return an error when the directory does not exist", async () => {
    fs.exists.mockReturnValue(false);

    const instance = injector().invoke(setWorkspaceTool);
    const result: any = await instance.handler({cwd: "/missing"} as any, {} as any);

    expect(projectPackage.setCWD).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.structuredContent.code).toBe("E_CWD_NOT_FOUND");
  });
});
