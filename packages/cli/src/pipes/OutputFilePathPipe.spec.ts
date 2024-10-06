// @ts-ignore
import {ProjectPackageJson} from "@tsed/cli-core";
import {DITest} from "@tsed/di";
import {normalizePath} from "@tsed/normalize-path";

import {ProvidersInfoService} from "../services/ProvidersInfoService.js";
import {ArchitectureConvention} from "./../interfaces/ArchitectureConvention.js";
import {ClassNamePipe} from "./ClassNamePipe.js";
import {OutputFilePathPipe} from "./OutputFilePathPipe.js";

async function getPipeFixture(opts: any = {}) {
  const providers = await DITest.invoke(ProvidersInfoService, []);
  providers.add(opts.provider);

  const classPipe = await DITest.invoke(ClassNamePipe, [
    {
      token: ProvidersInfoService,
      use: providers
    }
  ]);

  const pipe = await DITest.invoke(OutputFilePathPipe, [
    {
      token: ProvidersInfoService,
      use: providers
    },
    {
      token: ClassNamePipe,
      use: classPipe
    },
    {
      token: ProjectPackageJson,
      use: {
        preferences: opts.preferences || {}
      }
    }
  ]);

  return {
    pipe,
    providers,
    classPipe
  };
}

describe("OutputFilePathPipe", () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());
  describe("Ts.ED architecture", () => {
    it("should return the output file", async () => {
      const {pipe} = await getPipeFixture({
        provider: {
          name: "Controller",
          value: "controller",
          model: "{{symbolName}}.controller"
        }
      });

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
    it("should return the output file (controller with subDir)", async () => {
      const {pipe} = await getPipeFixture({
        provider: {
          name: "Controller",
          value: "controller",
          model: "{{symbolName}}.controller"
        }
      });

      expect(
        normalizePath(
          pipe.transform({
            type: "controller",
            name: "test",
            subDir: "rest"
          })
        )
      ).toEqual("controllers/rest/TestController");
    });
    it("should return the output file (datasource)", async () => {
      const {pipe} = await getPipeFixture({
        provider: {
          name: "TypeORM Datasource",
          value: "typeorm:datasource",
          model: "{{symbolName}}.datasource"
        }
      });

      expect(
        normalizePath(
          pipe.transform({
            type: "typeorm:datasource",
            name: "MySQL"
          })
        )
      ).toEqual("datasources/MySqlDatasource");
    });
  });
  describe("Angular architecture", () => {
    it("should return the output file", async () => {
      const {pipe} = await getPipeFixture({
        provider: {
          name: "Controller",
          value: "controller",
          model: "{{symbolName}}.controller"
        },
        preferences: {
          architecture: ArchitectureConvention.FEATURE
        }
      });

      expect(normalizePath(pipe.transform({type: "controller", name: "test"}))).toEqual("TestController");
      expect(
        normalizePath(
          pipe.transform({
            type: "controller",
            name: "test",
            baseDir: "other"
          })
        )
      ).toEqual("TestController");
      expect(normalizePath(pipe.transform({type: "server", name: "server"}))).toEqual("Server");
    });
    it("should return the output file (controller with subDir)", async () => {
      const {pipe} = await getPipeFixture({
        provider: {
          name: "Controller",
          value: "controller",
          model: "{{symbolName}}.controller"
        },
        preferences: {
          architecture: ArchitectureConvention.FEATURE
        }
      });

      expect(
        normalizePath(
          pipe.transform({
            type: "controller",
            name: "test",
            subDir: "rest"
          })
        )
      ).toEqual("rest/TestController");
    });
    it("should return the output file (datasource)", async () => {
      const {pipe} = await getPipeFixture({
        provider: {
          name: "TypeORM Datasource",
          value: "typeorm:datasource",
          model: "{{symbolName}}.datasource"
        },
        preferences: {
          architecture: ArchitectureConvention.FEATURE
        }
      });

      expect(
        normalizePath(
          pipe.transform({
            type: "typeorm:datasource",
            name: "MySQL"
          })
        )
      ).toEqual("MySqlDatasource");
    });
  });
});
