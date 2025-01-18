import {dirname, join} from "node:path";

import {inject, Injectable, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

import {ArchitectureConvention, ProjectConvention} from "../interfaces/index.js";
import {ProvidersInfoService} from "../services/ProvidersInfoService.js";
import {ClassNamePipe} from "./ClassNamePipe.js";

@Injectable()
export class OutputFilePathPipe {
  protected providers = inject(ProvidersInfoService);
  protected projectPackageJson = inject(ProjectPackageJson);
  protected classNamePipe = inject(ClassNamePipe);

  transform(options: {name: string; type: string; subDir?: string; baseDir?: string; format?: ProjectConvention}) {
    options.format = options.format || this.projectPackageJson.preferences.convention || ProjectConvention.DEFAULT;

    const featureDir = dirname(options.name);

    if (options.type === "server" || this.projectPackageJson.preferences.architecture === ArchitectureConvention.FEATURE) {
      return join(options.subDir || "", featureDir, this.classNamePipe.transform(options));
    }

    const baseDir = (options.baseDir || this.providers.get(options.type)?.baseDir || `${options.type}s`).split(":").at(-1);

    return join(baseDir, options.subDir || "", featureDir, this.classNamePipe.transform(options));
  }
}
