import {join} from "node:path";

import {CliFs} from "@tsed/cli-core";
import {constant, inject, injectable, injectMany, logger} from "@tsed/di";
import {globby} from "globby";
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
  readonly fs = inject(CliFs);
  readonly renderedFiles: TemplateRenderReturnType[] = [];

  #customTemplates: DefineTemplateOptions[];

  get rootDir() {
    return constant("project.rootDir", "");
  }

  get srcDir() {
    return join(...([this.rootDir, constant("project.srcDir")].filter(Boolean) as string[]));
  }

  get templatesDir() {
    return join(this.rootDir, ".templates");
  }

  $onInit() {
    return this.loadTemplates();
  }

  async loadTemplates() {
    if (!this.#customTemplates?.length) {
      const files = await globby("**/*.ts", {
        cwd: this.templatesDir
      });

      const promises = files.map(async (file) => {
        try {
          const files = join(this.templatesDir, file);
          const {default: token} = await import(files.replace(".ts", ".js"));

          if (token) {
            return inject(token);
          }
        } catch (er) {
          logger().warn("Unable to load custom template %s: %s", file, (er as Error).message);
        }
      });

      let customs = await Promise.all(promises);
      this.#customTemplates = customs.map((template) => {
        return {
          ...template,
          label: template.label + " (custom)"
        };
      });
    }
  }

  getAll() {
    const templates = injectMany<DefineTemplateOptions>("CLI_TEMPLATES");

    const map = (this.#customTemplates || []).concat(templates).reduce((acc, template) => {
      if (acc.has(template.id)) {
        return acc;
      }
      return acc.set(template.id, template);
    }, new Map());

    return [...map.values()];
  }

  find(id?: string) {
    const templates = this.getAll().filter((template) => !template.hidden);

    if (id) {
      id = id?.toLowerCase();

      const foundTemplates = templates.filter((template) => {
        return template.label.toLowerCase().includes(id!) || template.id.includes(id!);
      });

      return foundTemplates.length ? foundTemplates : templates;
    }

    return templates;
  }

  get(id: string) {
    return this.getAll().find((template) => template.id === id);
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

      return this.pushRenderResult({
        templateId,
        content: render,
        outputPath,
        name: opts.name,
        symbolName: opts.symbolName,
        symbolPath: opts.symbolPath,
        symbolPathBasename: opts.symbolPathBasename
      });
    } else {
      const from = data.from || TEMPLATE_DIR;
      const fromPath = join(from!, templateId.replace("{{srcDir}}", "src"));

      if (await this.fs.fileExists(fromPath)) {
        const content = await inject(CliFs).readFile(fromPath);

        return this.pushRenderResult({
          templateId,
          content,
          outputPath: templateId.replace("{{srcDir}}", constant("project.srcDir", ""))
        });
      }
    }
  }

  protected pushRenderResult(renderedFile: TemplateRenderReturnType) {
    this.renderedFiles.push(renderedFile);

    return renderedFile;
  }
}

injectable(CliTemplatesService);
