import {join} from "node:path";

// @ts-ignore
import {FakeCliFs, normalizePath} from "@tsed/cli-testing";
import Consolidate from "consolidate";
import {globby} from "globby";
import handlebars from "handlebars";

import {getTemplateDirectory} from "../utils/index.js";
import {RootRendererService, SrcRendererService} from "./Renderer.js";

const TEMPLATE_DIR = getTemplateDirectory(join(import.meta.url, "../../../cli-plugin-jest/src/utils"));

vi.mock("consolidate");
vi.mock("globby");
vi.mock("handlebars");

describe("Renderer", () => {
  afterEach(() => {
    FakeCliFs.entries.clear();
    vi.mocked(globby as any).mockResolvedValue(["_partials/one.hbs", "_partials/two.hbs"]);
  });

  describe("relativeFrom()", () => {
    it("should return the valid path from", () => {
      const service = new SrcRendererService();

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
      vi.mocked(globby as any).mockResolvedValue(["_partials/one.hbs", "_partials/two.hbs"]);

      const service = new RootRendererService();
      const path = "/init/myfile.ts.hbs";
      const data = {};
      const options = {
        baseDir: "/init"
      };

      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith("/tmpl/init/myfile.ts.hbs", {});
      expect(FakeCliFs.getKeys()).toEqual(["/home", "/home/myfile.ts"]);
    });
    it("should render a file from given option (TEMPLATE_DIR)", async () => {
      const service = new RootRendererService();
      const path = "/init/vi.config.js.hbs";
      const data = {};
      const options = {
        baseDir: "/init",
        templateDir: TEMPLATE_DIR
      };

      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith(normalizePath(`${TEMPLATE_DIR}/init/vi.config.js.hbs`), {});
      expect(FakeCliFs.getKeys()).toEqual(["/home", "/home/vi.config.js"]);
    });
    it("should render a file from given option (TEMPLATE_DIR - without baseDir)", async () => {
      const service = new RootRendererService();
      const path = "/vi.config.js.hbs";
      const data = {};
      const options = {
        templateDir: `${TEMPLATE_DIR}/init`
      };

      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith(normalizePath(`${TEMPLATE_DIR}/init/vi.config.js.hbs`), {});
      expect(FakeCliFs.getKeys()).toEqual(["/home", "/home/vi.config.js"]);
    });
    it("should render a file from given option (baseDir with deep directory)", async () => {
      const service = new RootRendererService();
      const path = "/init/config/myfile.ts.hbs";
      const data = {};
      const options = {
        baseDir: "/init"
      };

      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

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

      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith("/tmpl/init/controllers/myfile.ts.hbs", {});
      expect(FakeCliFs.getKeys()).toEqual(["/home/controllers", "/home/controllers/myFile.controller.ts"]);
    });
    it("should render a file from given option (with replaces)", async () => {
      const service = new RootRendererService();

      const props = {
        path: "/init/src/controllers/pages/IndexController.ts.hbs",
        basename: "index.controller.ts",
        dir: "/pages",
        replaces: ["controllers"]
      };

      const data = {};

      const options = {
        baseDir: "/init",
        ...props
      };

      // @ts-ignore
      service.configuration = {
        project: {
          rootDir: "/home",
          srcDir: "/src"
        }
      };

      service.templateDir = "/tmpl";

      // @ts-ignore
      Consolidate.handlebars.mockReturnValue("content");

      service.fs = new FakeCliFs() as any;

      await service.render(props.path, data, options);

      expect(Consolidate.handlebars).toHaveBeenCalledWith("/tmpl/init/src/controllers/pages/IndexController.ts.hbs", {});
      expect(FakeCliFs.getKeys()).toEqual(["/home/src/pages", "/home/src/pages/index.controller.ts"]);
    });
  });
  describe("loadPartials()", () => {
    it("should load partials", async () => {
      const rootRendererService = new RootRendererService();
      rootRendererService.fs = new FakeCliFs() as any;

      rootRendererService.fs.writeFile("/templateDir/_partials/one.hbs", "content");
      rootRendererService.fs.writeFile("/templateDir/_partials/two.hbs", "content");

      await rootRendererService.loadPartials("/templateDir");

      expect(handlebars.registerPartial).toHaveBeenCalledWith("one", "content");
      expect(handlebars.registerPartial).toHaveBeenCalledWith("two", "content");
    });
  });
});
