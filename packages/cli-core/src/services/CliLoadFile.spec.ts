import {catchAsyncError} from "@tsed/core";
import {DITest} from "@tsed/di";
import {s} from "@tsed/schema";

import {CliLoadFile} from "./CliLoadFile.js";

describe("CliLoadFile", () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());

  it("should load yaml file", async () => {
    const service = DITest.get<CliLoadFile>(CliLoadFile);

    const result = await service.loadFile(import.meta.dirname + "/__mock__/settings.yml");

    expect(result).toEqual({
      architecture: "default",
      convention: "default",
      features: ["babel"],
      platform: "express",
      projectName: "project-example"
    });
  });

  it("should not validate the schema", async () => {
    const service = DITest.get<CliLoadFile>(CliLoadFile);
    const CustomSchema = s
      .object({
        platform: s.string().enum("koa")
      })
      .unknown();

    const error = await catchAsyncError(() => service.loadFile(import.meta.dirname + "/__mock__/settings.yml", CustomSchema));

    expect(error?.message).toEqual(".platform must be equal to one of the allowed values");
  });

  it("should load json file", async () => {
    const service = DITest.get<CliLoadFile>(CliLoadFile);

    const result = await service.loadFile(import.meta.dirname + "/__mock__/settings.json");
    expect(result).toEqual({
      architecture: "default",
      convention: "default",
      features: [],
      platform: "express",
      projectName: "test"
    });
  });
});
