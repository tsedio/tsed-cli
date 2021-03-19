import {Injectable, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {dirname, join} from "path";
import {ProvidersInfoService} from "../services/ProvidersInfoService";
import {ClassNamePipe} from "./ClassNamePipe";
import {ProjectConvention} from "../interfaces/ProjectConvention";

@Injectable()
export class OutputFilePathPipe {
  @Inject()
  providers: ProvidersInfoService;

  @Inject()
  projectPackageJson: ProjectPackageJson;

  constructor(private classNamePipe: ClassNamePipe) {}

  transform(options: {name: string; type: string; baseDir?: string; format?: ProjectConvention}) {
    options.format = options.format || this.projectPackageJson.preferences.convention || ProjectConvention.DEFAULT;

    const dir = dirname(options.name);

    if (options.type === "server") {
      return join(dir, this.classNamePipe.transform(options));
    }

    const baseDir = options.baseDir || this.providers.get(options.type)?.baseDir || `${options.type}s`;

    return join(baseDir, dir, this.classNamePipe.transform(options));
  }
}
