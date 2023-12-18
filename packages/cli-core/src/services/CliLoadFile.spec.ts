import {DITest} from "@tsed/di";
import {catchAsyncError} from "@tsed/core";
import {CliLoadFile} from "./CliLoadFile";

describe("CliLoadFile", () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());

  it("should load yaml file", async () => {
    const service = DITest.get<CliLoadFile>(CliLoadFile);

    const result = await service.loadFile(__dirname + "/__mock__/settings.yml");

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

    const error = await catchAsyncError(() =>
      service.loadFile(__dirname + "/__mock__/settings.yml", {
        type: "object",
        additionalProperties: true,
        properties: {
          platform: {
            type: "string",
            enum: ["koa"]
          }
        }
      })
    );

    expect(error?.message).toEqual(".platform must be equal to one of the allowed values. Allowed values: koa");
  });

  it("should load json file", async () => {
    const service = DITest.get<CliLoadFile>(CliLoadFile);

    const result = await service.loadFile(__dirname + "/__mock__/settings.json");
    expect(result).toEqual({
      architecture: "default",
      convention: "default",
      features: [],
      platform: "express",
      projectName: "test"
    });
  });
});
