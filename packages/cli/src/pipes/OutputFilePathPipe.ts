import {Injectable, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {dirname, join} from "path";
import {ProvidersInfoService} from "../services/ProvidersInfoService";
import {ClassNamePipe} from "./ClassNamePipe";
import {ProjectConvention, ArchitectureConvention} from "../interfaces";

@Injectable()
export class OutputFilePathPipe {
  @Inject()
  providers: ProvidersInfoService;

  @Inject()
  projectPackageJson: ProjectPackageJson;

  constructor(private classNamePipe: ClassNamePipe) {}

  transform(options: {name: string; type: string; subDir?: string; baseDir?: string; format?: ProjectConvention}) {
    options.format = options.format || this.projectPackageJson.preferences.convention || ProjectConvention.DEFAULT;

    const featureDir = dirname(options.name);

    if (options.type === "server" || this.projectPackageJson.preferences.architecture === ArchitectureConvention.FEATURE) {
      return join(options.subDir || "", featureDir, this.classNamePipe.transform(options));
    }

    const baseDir = options.baseDir || this.providers.get(options.type)?.baseDir || `${options.type}s`;

    return join(baseDir, options.subDir || "", featureDir, this.classNamePipe.transform(options));
  }
}
