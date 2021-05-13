import {RootRendererService, SrcRendererService} from "@tsed/cli-core";
import {FakeCliFs, normalizePath} from "@tsed/cli-testing";
import * as Consolidate from "consolidate";
import {TEMPLATE_DIR} from "../../../cli-plugin-jest/src/utils/templateDir";

jest.mock("consolidate");

describe("Renderer", () => {
  afterEach(() => {
    FakeCliFs.entries.clear();
  });

  describe("relativeFrom()", () => {
    it("should return the revalite path from", () => {
      const service = new SrcRendererService();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      expect(service.relativeFrom("/controller/users.spec.ts")).toEqual("..");
      expect(normalizePath(service.relativeFrom("/controller/users/users.spec.ts"))).toEqual("../..");
    });
  });
  describe("render()", () => {
    it("should render a file from given option (baseDir)", async () => {
      const service = new RootRendererService();
      const path = "/init/myfile.ts.hbs";
      const data = {};
      const options = {
        baseDir: "/init"
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith("/tmpl/init/myfile.ts.hbs", {});
      expect(FakeCliFs.getKeys()).toEqual(["/home", "/home/myfile.ts"]);
    });
    it("should render a file from given option (TEMPLATE_DIR)", async () => {
      const service = new RootRendererService();
      const path = "/init/jest.config.js.hbs";
      const data = {};
      const options = {
        baseDir: "/init",
        templateDir: TEMPLATE_DIR
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith(normalizePath(`${TEMPLATE_DIR}/init/jest.config.js.hbs`), {});
      expect(FakeCliFs.getKeys()).toEqual(["/home", "/home/jest.config.js"]);
    });
    it("should render a file from given option (TEMPLATE_DIR - without baseDir)", async () => {
      const service = new RootRendererService();
      const path = "/jest.config.js.hbs";
      const data = {};
      const options = {
        templateDir: `${TEMPLATE_DIR}/init`
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith(normalizePath(`${TEMPLATE_DIR}/init/jest.config.js.hbs`), {});
      expect(FakeCliFs.getKeys()).toEqual(["/home", "/home/jest.config.js"]);
    });
    it("should render a file from given option (baseDir with deep directory)", async () => {
      const service = new RootRendererService();
      const path = "/init/config/myfile.ts.hbs";
      const data = {};
      const options = {
        baseDir: "/init"
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith("/tmpl/init/config/myfile.ts.hbs", {});
      expect(FakeCliFs.getKeys()).toEqual(["/home/config", "/home/config/myfile.ts"]);
    });
    it("should render a file from given option (baseDir and basename)", async () => {
      const service = new RootRendererService();
      const path = "/init/controllers/myfile.ts.hbs";
      const data = {};
      const options = {
        baseDir: "/init",
        basename: "myFile.controller.ts"
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith("/tmpl/init/controllers/myfile.ts.hbs", {});
      expect(FakeCliFs.getKeys()).toEqual(["/home/controllers", "/home/controllers/myFile.controller.ts"]);
    });
  });
});
