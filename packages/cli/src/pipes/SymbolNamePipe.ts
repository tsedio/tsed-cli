import {basename} from "node:path";

import {ProjectPackageJson} from "@tsed/cli-core";
import {inject, injectable} from "@tsed/di";
import {kebabCase, pascalCase} from "change-case";

import {ProjectConvention} from "../interfaces/ProjectConvention.js";
import {CliTemplatesService} from "../services/CliTemplatesService.js";

export class SymbolNamePipe {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected templates = inject(CliTemplatesService);

  transform(options: {name: string; type: string; format?: ProjectConvention}) {
    if (options.name === "index") {
      return options.name;
    }

    const format = options.format || this.projectPackageJson.preferences.convention || ProjectConvention.DEFAULT;
    const template = this.templates.get(options.type);

    if (template?.preserveCase) {
      return template.fileName || options.name;
    }

    const meta = template?.fileName || "{{symbolName}}.{{symbolType}}?";

    const type = options.type.split(":").at(-1)!;

    const symbolName = kebabCase(basename(options.name)).replace(`-${type}`, "");

    const names = meta.split(".").reduce((acc: Set<string>, key: string) => {
      return key
        .replace(/{{symbolName}}/gi, symbolName)
        .replace(/{{symbolType}}/gi, type)
        .split(".")
        .filter((value) => (format === ProjectConvention.DEFAULT ? !value.endsWith("?") : true))
        .map((value) => value.replace(/\?$/, "").toLowerCase())
        .reduce((acc, value) => acc.add(value), acc);
    }, new Set());

    if (format === ProjectConvention.DEFAULT) {
      return pascalCase([...names].join("."));
    }

    return [...names].join(".").toLowerCase();
  }
}

injectable(SymbolNamePipe);
