import "../templates/index.js";

import {ProjectPackageJson} from "@tsed/cli-core";
import {DITest, inject} from "@tsed/di";
import {normalizePath} from "@tsed/normalize-path";

import {ArchitectureConvention} from "./../interfaces/ArchitectureConvention.js";
import {OutputFilePathPipe} from "./OutputFilePathPipe.js";
import {SymbolNamePipe} from "./SymbolNamePipe.js";

async function getPipeFixture(opts: any = {}) {
  const classPipe = inject(SymbolNamePipe);

  const pipe = await DITest.invoke(OutputFilePathPipe, [
    {
      token: SymbolNamePipe,
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
    classPipe
  };
}

describe("OutputFilePathPipe", () => {
  beforeEach(() =>
    DITest.create({
      project: {
        rootDir: "/project",
        srcDir: "src"
      }
    })
  );
  afterEach(() => DITest.reset());
  describe("Ts.ED architecture", () => {
    it("should return the output file", async () => {
      const {pipe} = await getPipeFixture({});

      expect(
        normalizePath(
          pipe.transform({
            type: "controller",
            name: "test"
          })
        )
      ).toEqual("src/controllers/TestController");

      expect(
        normalizePath(
          pipe.transform({
            type: "controller",
            name: "test",
            baseDir: "other"
          })
        )
      ).toEqual("src/other/TestController");

      // expect(normalizePath(pipe.transform({type: "server", name: "server"}))).toEqual("Server");
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
      ).toEqual("src/controllers/rest/TestController");
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

      expect(normalizePath(pipe.transform({type: "controller", name: "test"}))).toEqual("src/TestController");
      expect(
        normalizePath(
          pipe.transform({
            type: "controller",
            name: "test",
            baseDir: "other"
          })
        )
      ).toEqual("src/TestController");
      expect(normalizePath(pipe.transform({type: "server", name: "server"}))).toEqual("src/Server");
    });
    it("should return the output file (controller with subDir)", async () => {
      const {pipe} = await getPipeFixture({
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
      ).toEqual("src/rest/TestController");
    });
  });
});
