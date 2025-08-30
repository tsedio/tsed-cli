import {inject, ProjectPackageJson} from "@tsed/cli-core";
import {normalizePath} from "@tsed/normalize-path";

import type {GenerateCmdContext} from "../../../interfaces/GenerateCmdContext.js";
import {ProjectConvention} from "../../../interfaces/ProjectConvention.js";
import {OutputFilePathPipe} from "../../../pipes/OutputFilePathPipe.js";
import {SymbolNamePipe} from "../../../pipes/SymbolNamePipe.js";

export function mapGenerateContext(ctx: Partial<GenerateCmdContext>) {
  const classNamePipe = inject(SymbolNamePipe);
  const outputFilePathPipe = inject(OutputFilePathPipe);
  const projectPackageJson = inject(ProjectPackageJson);

  const {name = ""} = ctx;
  let {type = ""} = ctx;
  type = type.toLowerCase();

  if (ctx.name === "prisma" && ctx.name) {
    type = "prisma.service";
  }

  const symbolName = classNamePipe.transform({name, type, format: ProjectConvention.DEFAULT});
  const symbolPath = normalizePath(
    outputFilePathPipe.transform({
      name,
      type,
      subDir: ctx.directory
    })
  );

  return {
    ...projectPackageJson.fillWithPreferences(ctx),
    type,
    symbolName,
    symbolPath,
    symbolPathBasename: normalizePath(classNamePipe.transform({name, type}))
  } as GenerateCmdContext;
}
