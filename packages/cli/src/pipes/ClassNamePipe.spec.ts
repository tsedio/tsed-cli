import "../templates/index.js";

import {ProjectPackageJson} from "@tsed/cli-core";
import {DITest} from "@tsed/di";

import {ProjectConvention} from "../interfaces/index.js";
import {SymbolNamePipe} from "./SymbolNamePipe.js";

describe("ClassNamePipe", () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());
  it("should return the className", async () => {
    const pipe = await DITest.invoke(SymbolNamePipe, [
      {
        token: ProjectPackageJson,
        use: {
          preferences: {}
        }
      }
    ]);

    expect(pipe.transform({type: "controller", name: "test"})).toEqual("TestController");
    expect(
      pipe.transform({
        type: "controller",
        name: "test",
        format: ProjectConvention.ANGULAR
      })
    ).toEqual("test.controller");
    expect(
      pipe.transform({
        type: "controller",
        name: "HelloWorld",
        format: ProjectConvention.ANGULAR
      })
    ).toEqual("hello-world.controller");
    expect(pipe.transform({type: "server", name: "Server"})).toEqual("Server");
    expect(pipe.transform({type: "server", name: "Server", format: ProjectConvention.ANGULAR})).toEqual("server");
    expect(pipe.transform({type: "factory", name: "Connection"})).toEqual("Connection");
    expect(
      pipe.transform({
        type: "factory",
        name: "Connection",
        format: ProjectConvention.ANGULAR
      })
    ).toEqual("connection.factory");
  });
});
