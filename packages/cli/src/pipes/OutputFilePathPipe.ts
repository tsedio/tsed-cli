import {Injectable} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {dirname, join} from "path";
import {ProvidersInfoService} from "../services/ProvidersInfoService";
import {ClassNamePipe} from "./ClassNamePipe";

@Injectable()
export class OutputFilePathPipe {
  @Inject()
  providers: ProvidersInfoService;

  constructor(private classNamePipe: ClassNamePipe) {}

  transform(options: {name: string; type: string; baseDir?: string; format?: "tsed" | "angular"}) {
    const dir = dirname(options.name);

    if (options.type === "server") {
      return join(dir, this.classNamePipe.transform(options));
    }

    const baseDir = options.baseDir || this.providers.get(options.type)?.baseDir || `${options.type}s`;

    return join(baseDir, dir, this.classNamePipe.transform(options));
  }
}
