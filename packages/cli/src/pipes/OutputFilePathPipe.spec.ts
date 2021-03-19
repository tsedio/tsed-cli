import {ProvidersInfoService} from "@tsed/cli";
import {ClassNamePipe} from "./ClassNamePipe";
import {OutputFilePathPipe} from "./OutputFilePathPipe";
import {normalizePath} from "@tsed/cli-testing";

describe("OutputFilePathPipe", () => {
  it("should return the outputfile", () => {
    const providers = new ProvidersInfoService();
    providers.add({
      name: "Controller",
      value: "controller",
      model: "{{symbolName}}.controller"
    });

    const classPipe = new ClassNamePipe();
    classPipe.providers = providers;

    const pipe = new OutputFilePathPipe(classPipe);
    pipe.providers = providers;
    pipe.projectPackageJson = {
      preferences: {}
    } as any;

    expect(normalizePath(pipe.transform({type: "controller", name: "test"}))).toEqual("controllers/TestController");
    expect(
      normalizePath(
        pipe.transform({
          type: "controller",
          name: "test",
          baseDir: "other"
        })
      )
    ).toEqual("other/TestController");
    expect(normalizePath(pipe.transform({type: "server", name: "server"}))).toEqual("Server");
  });
});
