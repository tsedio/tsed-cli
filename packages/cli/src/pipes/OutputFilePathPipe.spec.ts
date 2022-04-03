import {ArchitectureConvention} from "./../interfaces/ArchitectureConvention";
import {ProvidersInfoService} from "@tsed/cli";
import {ClassNamePipe} from "./ClassNamePipe";
import {OutputFilePathPipe} from "./OutputFilePathPipe";
import {normalizePath} from "@tsed/cli-testing";

describe("OutputFilePathPipe", () => {
  describe("Ts.ED architecture", () => {
    it("should return the output file", () => {
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
    it("should return the output file (controller with subDir)", () => {
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
    it("should return the output file (datasource)", () => {
      const providers = new ProvidersInfoService();
      providers.add({
        name: "TypeORM Datasource",
        value: "typeorm:datasource",
        model: "{{symbolName}}.datasource"
      });

      const classPipe = new ClassNamePipe();
      classPipe.providers = providers;

      const pipe = new OutputFilePathPipe(classPipe);
      pipe.providers = providers;
      pipe.projectPackageJson = {
        preferences: {}
      } as any;

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
    it("should return the output file", () => {
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
        preferences: {
          architecture: ArchitectureConvention.FEATURE
        }
      } as any;

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
    it("should return the output file (controller with subDir)", () => {
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
        preferences: {
          architecture: ArchitectureConvention.FEATURE
        }
      } as any;

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
    it("should return the output file (datasource)", () => {
      const providers = new ProvidersInfoService();
      providers.add({
        name: "TypeORM Datasource",
        value: "typeorm:datasource",
        model: "{{symbolName}}.datasource"
      });

      const classPipe = new ClassNamePipe();
      classPipe.providers = providers;

      const pipe = new OutputFilePathPipe(classPipe);
      pipe.providers = providers;
      pipe.projectPackageJson = {
        preferences: {
          architecture: ArchitectureConvention.FEATURE
        }
      } as any;

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
