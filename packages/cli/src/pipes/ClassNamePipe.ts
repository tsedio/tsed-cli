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

    const symbolName = paramCase(basename(options.name));
    const meta = this.providers.get(options.type)?.model || "{{symbolName}}.{{symbolType}}?";

    const names = meta.split(".").reduce((acc: string[], key: string) => {
      key = key.replace(/{{symbolName}}/gi, symbolName).replace(/{{symbolType}}/gi, options.type);

      key.split(".").forEach((value) => {
        if (format === ProjectConvention.DEFAULT && value.endsWith("?")) {
          return;
        }

        value = value.replace(/\?$/, "").toLowerCase();

        if (!acc.includes(value)) {
          acc.push(value);
        }
      });

      return acc;
    }, []);

    if (format === ProjectConvention.DEFAULT) {
      return pascalCase(names.join("."));
    }

    return names.join(".").toLowerCase();
  }
}
