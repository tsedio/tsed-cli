import {Injectable} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {paramCase, pascalCase} from "change-case";
import {basename} from "path";
import {ProvidersInfoService} from "../services/ProvidersInfoService";

@Injectable()
export class ClassNamePipe {
  @Inject()
  providers: ProvidersInfoService;

  transform(options: {name: string; type: string; format?: "tsed" | "angular"}) {
    const format = options.format || "tsed";
    const symbolName = paramCase(basename(options.name)).replace(/-/gi, ".");
    const meta = this.providers.get(options.type)?.model || "{{symbolName}}.{{symbolType}}?";

    const names = meta.split(".").reduce((acc: string[], key: string) => {
      key = key.replace(/{{symbolName}}/gi, symbolName).replace(/{{symbolType}}/gi, options.type);

      key.split(".").forEach(value => {
        if (format === "tsed" && value.endsWith("?")) {
          return;
        }

        value = value.replace(/\?$/, "").toLowerCase();

        if (!acc.includes(value)) {
          acc.push(value);
        }
      });

      return acc;
    }, []);

    if (format === "tsed") {
      return pascalCase(names.join("."));
    }

    return names.join(".").toLowerCase();
  }
}
