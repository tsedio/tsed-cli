import {injectable, type ProviderOpts, type QuestionOptions} from "@tsed/cli-core";

import type {GenerateCmdContext} from "../interfaces/index.js";
import type {TemplateRenderReturnType} from "../services/CliTemplatesService.js";

export type DefineTemplateOptions = {
  id: string;
  label: string;
  description?: string;
  outputDir: string;
  type?: string;
  /**
   * The file name format without the extension.
   */
  fileName?: string;
  /**
   * The file extension. Default to `ts`
   * Don't include the dot (.) in the extension.
   */
  ext?: string | null;
  /**
   * If `true` the template will be hidden in the list of available templates
   * during the generate command.
   */
  hidden?: boolean;
  /**
   * If `true` the file name won't be altered (e.g. `MyService` will always be `MyService.ts`)
   * If `false` the file name will be transformed depending on the project style (e.g. `MyService` could be `my-service.ts`).
   * @default false
   */
  preserveCase?: boolean;
  /**
   * If `true` the directory structure will be preserved when generating the file.
   */
  preserveDirectory?: boolean;

  render(
    symbolName: string,
    data: GenerateCmdContext
  ): Promise<string | undefined | TemplateRenderReturnType> | string | undefined | TemplateRenderReturnType;
  prompts?(data: GenerateCmdContext): QuestionOptions<GenerateCmdContext>[] | Promise<QuestionOptions<GenerateCmdContext>[]>;

  hooks?: ProviderOpts["hooks"];
};

export function defineTemplate(opts: DefineTemplateOptions) {
  const provider = injectable(Symbol.for(`TEMPLATE:${opts.id}`))
    .type("CLI_TEMPLATES")
    .factory(() => ({
      ext: "ts",
      ...opts
    }));

  if (opts.hooks) {
    provider.hooks(opts.hooks);
  }

  return opts;
}
