import {ProvidersInfoService} from "@tsed/cli";
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

    pipe.transform({type: "controller", name: "test"}).should.deep.eq("TestController");
    pipe.transform({type: "controller", name: "test", format: "angular"}).should.deep.eq("test.controller");
    pipe.transform({type: "server", name: "Server"}).should.deep.eq("Server");
    pipe.transform({type: "server", name: "Server", format: "angular"}).should.deep.eq("server");
    pipe.transform({type: "factory", name: "Connection"}).should.deep.eq("Connection");
    pipe.transform({type: "factory", name: "Connection", format: "angular"}).should.deep.eq("connection.factory");
  });
});
