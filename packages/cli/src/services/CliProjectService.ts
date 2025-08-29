import {dirname, join, relative} from "node:path";

import {CliFs, inject} from "@tsed/cli-core";
import {constant, injectable} from "@tsed/di";
import {$asyncAlter} from "@tsed/hooks";
import {normalizePath} from "@tsed/normalize-path";
import {globbySync} from "globby";

import type {RenderDataContext} from "../interfaces/RenderDataContext.js";
import {PlatformsModule} from "../platforms/PlatformsModule.js";
import {InitExpressPlatform} from "../platforms/supports/InitExpressPlatform.js";
import {InitFastifyPlatform} from "../platforms/supports/InitFastifyPlatform.js";
import {InitKoaPlatform} from "../platforms/supports/InitKoaPlatform.js";
import {transformBinFile} from "../processors/transformBinFile.js";
import {transformConfigFile} from "../processors/transformConfigFile.js";
import {transformIndexFile} from "../processors/transformIndexFile.js";
import {transformServerFile} from "../processors/transformServerFile.js";
import {ProjectClient} from "../services/ProjectClient.js";
import {CliTemplatesService, type TemplateRenderOptions, type TemplateRenderReturnType} from "./CliTemplatesService.js";

export class CliProjectService {
  readonly templates = inject(CliTemplatesService);
  private project: ProjectClient;
  private rootDir = constant("project.rootDir", process.cwd());

  get srcDir() {
    return join(...([this.rootDir, constant("project.srcDir")].filter(Boolean) as string[]));
  }

  getRelativePath(path: string) {
    return normalizePath(relative(dirname(join(this.srcDir, path)), this.rootDir));
  }

  getServerFileName() {
    return this.get().getSource("Server.ts") ? "Server" : "server";
  }

  get() {
    if (this.project) {
      return this.project;
    }

    const fs = inject(CliFs);

    this.project = new ProjectClient({
      // tsConfigFilePath: join(this.rootDir, "tsconfig.json"),
      rootDir: this.rootDir
    });

    const files = fs.globSync([join(constant("project.rootDir", process.cwd()), "**/*.ts")]);

    files.forEach((file) => {
      this.project.createSourceFile(file, fs.readFileSync(file, "utf8"), {
        overwrite: true
      });
    });

    return this.project;
  }

  async transformFiles(data: RenderDataContext) {
    const project = this.get();

    if (data.commandName === "init") {
      transformIndexFile(project, data);
    }

    transformServerFile(project, data);
    transformConfigFile(project, data);
    transformBinFile(project, data);

    if (data.platform) {
      const platform = inject(PlatformsModule).get(data.platform);

      platform.alterProjectFiles(project, data);
    }

    await $asyncAlter(`$alterProjectFiles`, project, [data]);

    await Promise.all(
      project.getSourceFiles().map((sourceFile) => {
        sourceFile.organizeImports();
        return sourceFile.save();
      })
    );
  }

  async createFromTemplate(templateId: string, ctx: TemplateRenderOptions): Promise<TemplateRenderReturnType | undefined> {
    const obj = await this.templates.render(templateId, ctx);
    const project = this.get();

    if (obj) {
      const sourceFile = await project.createSource(obj.outputPath, obj.content, {
        overwrite: true
      });

      return {
        ...obj,
        source: sourceFile
      };
    }
  }

  getDirectories(dir: string) {
    const directories = globbySync("**/*", {
      cwd: join(this.srcDir, dir),
      ignore: ["__*"]
    });

    const set = new Set(
      directories.map((dir) => {
        return dirname(dir);
      })
    );

    set.delete(".");

    return [...set];
  }
}

injectable(PlatformsModule).imports([InitExpressPlatform, InitKoaPlatform, InitFastifyPlatform]);
