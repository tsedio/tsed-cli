import {Injectable, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {paramCase, pascalCase} from "change-case";
import {basename} from "path";
import {ProvidersInfoService} from "../services/ProvidersInfoService";
import {ProjectConvention} from "../interfaces/ProjectConvention";

@Injectable()
export class ClassNamePipe {
  @Inject()
  providers: ProvidersInfoService;

  @Inject()
  projectPackageJson: ProjectPackageJson;

  transform(options: {name: string; type: string; format?: ProjectConvention}) {
    const format = options.format || this.projectPackageJson.preferences.convention || ProjectConvention.DEFAULT;

    const meta = this.providers.get(options.type)?.model || "{{symbolName}}.{{symbolType}}?";
    const type = options.type.split(":").at(-1)!;
    const symbolName = paramCase(basename(options.name)).replace(`-${type}`, "");

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
