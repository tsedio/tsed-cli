import {basename, dirname, join} from "node:path";

import {inject, injectable, ProjectPackageJson} from "@tsed/cli-core";
import {constant} from "@tsed/di";

import {ArchitectureConvention, ProjectConvention} from "../interfaces/index.js";
import {CliTemplatesService} from "../services/CliTemplatesService.js";
import {SymbolNamePipe} from "./SymbolNamePipe.js";

export class OutputFilePathPipe {
  protected templatesService = inject(CliTemplatesService);
  protected projectPackageJson = inject(ProjectPackageJson);
  protected classNamePipe = inject(SymbolNamePipe);

  transform(options: {name: string; type: string; subDir?: string; baseDir?: string; format?: ProjectConvention}) {
    const template = this.templatesService.get(options.type);
    const {outputDir, preserveCase, preserveDirectory} = template || {};
    const hasSrcDir = outputDir?.includes("{{srcDir}}");

    options.format = options.format || this.projectPackageJson.preferences.convention || ProjectConvention.DEFAULT;

    const featureDir = dirname(options.name);

    const baseDir = this.getBaseDir(options.baseDir, outputDir, options.type);

    if (!preserveCase && !preserveDirectory && this.projectPackageJson.preferences.architecture === ArchitectureConvention.FEATURE) {
      return join(hasSrcDir ? constant("project.srcDir", "") : "", options.subDir || "", featureDir, this.classNamePipe.transform(options));
    }

    return join(
      hasSrcDir ? constant("project.srcDir", "") : "",
      baseDir,
      options.subDir || "",
      featureDir,
      this.classNamePipe.transform(options)
    );
  }

  private getBaseDir(baseDir: string | undefined, outputDir: string | undefined, type: string) {
    if (baseDir) {
      return baseDir;
    }

    if (outputDir) {
      return outputDir.replace(/\{\{srcDir}}/, "");
    }

    return `${type}s`.split(":").at(-1) || "";
  }

  getServerName() {
    return basename(
      `${this.transform({
        name: "Server",
        type: "server",
        format: this.projectPackageJson.preferences.convention
      })}.ts`
    );
  }

  getIndexControllerName() {
    return basename(
      `${this.transform({
        name: "Index",
        type: "controller",
        format: this.projectPackageJson.preferences.convention
      })}.ts`
    );
  }
}

injectable(OutputFilePathPipe);
