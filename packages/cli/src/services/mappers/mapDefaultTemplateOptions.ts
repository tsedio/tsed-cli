import {inject, ProjectPackageJson} from "@tsed/cli-core";
import {normalizePath} from "@tsed/normalize-path";

import type {GenerateCmdContext} from "../../interfaces/GenerateCmdContext.js";
import {ProjectConvention} from "../../interfaces/ProjectConvention.js";
import {OutputFilePathPipe} from "../../pipes/OutputFilePathPipe.js";
import {SymbolNamePipe} from "../../pipes/SymbolNamePipe.js";

type TemplateOptions = {
  type?: string;
  name?: string;
  symbolName?: string;
  symbolPath?: string;
  symbolPathBasename?: string;
  directory?: string;
};

export function mapDefaultTemplateOptions(opts: TemplateOptions) {
  const classNamePipe = inject(SymbolNamePipe);
  const outputFilePathPipe = inject(OutputFilePathPipe);
  const projectPackageJson = inject(ProjectPackageJson);

  const {name = ""} = opts;
  let {type = ""} = opts;
  type = type.toLowerCase();

  if (opts.name === "prisma" && opts.name) {
    type = "prisma.service";
  }

  const symbolName = opts.symbolName || classNamePipe.transform({name, type, format: ProjectConvention.DEFAULT});
  const symbolPath =
    opts.symbolPath ||
    normalizePath(
      outputFilePathPipe.transform({
        name,
        type,
        subDir: opts.directory
      })
    );

  return {
    ...projectPackageJson.fillWithPreferences(opts),
    type,
    symbolName,
    symbolPath,
    symbolPathBasename: opts.symbolPathBasename || normalizePath(classNamePipe.transform({name, type}))
  } as unknown as GenerateCmdContext;
}
