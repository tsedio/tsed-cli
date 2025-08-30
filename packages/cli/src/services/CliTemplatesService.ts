import {join} from "node:path";

import {CliFs} from "@tsed/cli-core";
import {constant, inject, injectable, injectMany} from "@tsed/di";
import type {SourceFile} from "ts-morph";

import {TEMPLATE_DIR} from "../constants/index.js";
import type {RenderDataContext} from "../interfaces/index.js";
import type {DefineTemplateOptions} from "../utils/defineTemplate.js";
import {mapDefaultTemplateOptions} from "./mappers/mapDefaultTemplateOptions.js";

export type TemplateRenderOptions = {
  name?: string;
  symbolName?: string;
  symbolPath?: string;
  directory?: string;
  from?: string;
} & Partial<RenderDataContext>;

export type TemplateRenderReturnType = {
  templateId: string;
  content: string;
  outputPath: string;
  name?: string;
  symbolName?: string;
  symbolPath?: string;
  symbolPathBasename?: string;
  source?: SourceFile;
};

export class CliTemplatesService {
  readonly rootDir = constant("project.rootDir", process.cwd());
  readonly fs = inject(CliFs);

  get srcDir() {
    return join(...([this.rootDir, constant("project.srcDir")].filter(Boolean) as string[]));
  }

  find(id?: string) {
    const templates = injectMany<DefineTemplateOptions>("CLI_TEMPLATES").filter((template) => !template.hidden);

    id = id?.toLowerCase();

    const foundTemplates = templates.filter((template) => {
      return template.label.toLowerCase().includes(id!) || template.id.includes(id!);
    });

    return foundTemplates.length ? foundTemplates : templates;
  }

  get(id: string) {
    const templates = injectMany<DefineTemplateOptions>("CLI_TEMPLATES");

    return templates.find((template) => template.id === id);
  }

  async render(templateId: string, data: TemplateRenderOptions): Promise<TemplateRenderReturnType | undefined> {
    const template = this.get(templateId);

    if (template) {
      const opts = mapDefaultTemplateOptions({
        ...data,
        type: templateId
      });

      const render = await template.render(opts.symbolName, opts as any);

      if (render === undefined) {
        return;
      }

      if (typeof render === "object") {
        return render;
      }

      const filePath =
        opts.symbolPath ||
        template.fileName?.replace("{{symbolName}}", opts.symbolName)?.replace("{{srcDir}}", this.srcDir) ||
        opts.symbolName;

      const outputPath = `${filePath}${template.ext ? "." + template.ext : ""}`;

      return {
        templateId,
        content: render,
        outputPath,
        name: opts.name,
        symbolName: opts.symbolName,
        symbolPath: opts.symbolPath,
        symbolPathBasename: opts.symbolPathBasename
      };
    } else {
      const from = data.from || TEMPLATE_DIR;
      const fromPath = join(from!, templateId.replace("{{srcDir}}", "src"));

      if (this.fs.fileExistsSync(fromPath)) {
        return {
          templateId,
          content: await inject(CliFs).readFile(fromPath),
          outputPath: templateId.replace("{{srcDir}}", constant("project.srcDir", ""))
        };
      }
    }
  }
}

injectable(CliTemplatesService);
