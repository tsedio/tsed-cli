import {ProvidersInfoService} from "../services/ProvidersInfoService";
import {ClassNamePipe} from "./ClassNamePipe";

describe("ClassNamePipe", () => {
  it("should return the className", () => {
    const pipe = new ClassNamePipe();
    pipe.providers = new ProvidersInfoService();

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
    expect(pipe.transform({type: "controller", name: "test", format: "angular"})).toEqual("test.controller");
    expect(pipe.transform({type: "server", name: "Server"})).toEqual("Server");
    expect(pipe.transform({type: "server", name: "Server", format: "angular"})).toEqual("server");
    expect(pipe.transform({type: "factory", name: "Connection"})).toEqual("Connection");
    expect(pipe.transform({type: "factory", name: "Connection", format: "angular"})).toEqual("connection.factory");
  });
});
