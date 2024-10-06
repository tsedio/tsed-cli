import {ProjectPackageJson} from "@tsed/cli-core";
import {DITest} from "@tsed/di";

import {ProjectConvention} from "../interfaces/index.js";
import {ClassNamePipe} from "./ClassNamePipe.js";

describe("ClassNamePipe", () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());
  it("should return the className", async () => {
    const pipe = await DITest.invoke(ClassNamePipe, [
      {
        token: ProjectPackageJson,
        use: {
          preferences: {}
        }
      }
    ]);

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

    pipe.providers.add({
      name: "Factory",
      value: "factory",
      model: "{{symbolName}}.factory?"
    });
    pipe.providers.add({
      name: "TypeORM Datasource",
      value: "typeorm:datasource",
      model: "{{symbolName}}.datasource"
    });

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
    expect(pipe.transform({type: "typeorm:datasource", name: "MySQLDatasource"})).toEqual("MySqlDatasource");
    expect(
      pipe.transform({
        type: "typeorm:datasource",
        name: "MySQLDatasource",
        format: ProjectConvention.ANGULAR
      })
    ).toEqual("my-sql.datasource");
  });
});
