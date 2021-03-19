import {ProvidersInfoService} from "../services/ProvidersInfoService";
import {ClassNamePipe} from "./ClassNamePipe";
import {ProjectConvention} from "@tsed/cli";

describe("ClassNamePipe", () => {
  it("should return the className", () => {
    const pipe = new ClassNamePipe();
    pipe.providers = new ProvidersInfoService();
    pipe.projectPackageJson = {
      preferences: {}
    } as any;

    pipe.providers.add({
      name: "Controller",
      value: "controller",
      model: "{{symbolName}}.controller"
    });

    pipe.providers.add({
      name: "Factory",
      value: "factory",
      model: "{{symbolName}}.factory?"
    });

    expect(pipe.transform({type: "controller", name: "test"})).toEqual("TestController");
    expect(pipe.transform({type: "controller", name: "test", format: ProjectConvention.ANGULAR})).toEqual("test.controller");
    expect(pipe.transform({type: "controller", name: "HelloWorld", format: ProjectConvention.ANGULAR})).toEqual("hello-world.controller");
    expect(pipe.transform({type: "server", name: "Server"})).toEqual("Server");
    expect(pipe.transform({type: "server", name: "Server", format: ProjectConvention.ANGULAR})).toEqual("server");
    expect(pipe.transform({type: "factory", name: "Connection"})).toEqual("Connection");
    expect(pipe.transform({type: "factory", name: "Connection", format: ProjectConvention.ANGULAR})).toEqual("connection.factory");
  });
});
