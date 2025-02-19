import {type GenerateCmdContext, SrcRendererService} from "@tsed/cli";
import {inject, Injectable, OnExec, type Tasks} from "@tsed/cli-core";
import {normalizePath} from "@tsed/normalize-path";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

@Injectable()
export class JestGenerateHook {
  srcRenderService = inject(SrcRendererService);

  @OnExec("generate")
  onGenerateExec(ctx: GenerateCmdContext): Tasks {
    const {symbolPath} = ctx;
    const {specTemplate, integrationTemplate, relativeSrcPath} = this.mapOptions(ctx);

    return [
      {
        title: `Generate ${ctx.type} spec file to '${symbolPath}.spec.ts'`,
        enabled() {
          return !(ctx.type === "server" || ctx.type.includes(":dataSource") || ctx.type.includes(":connection"));
        },
        task: () =>
          this.srcRenderService.render(
            specTemplate,
            {...ctx, relativeSrcPath},
            {
              output: `${symbolPath}.spec.ts`,
              templateDir: TEMPLATE_DIR
            }
          )
      },
      {
        title: `Generate ${ctx.type} integration file '${symbolPath}.integration.spec.ts'`,
        enabled() {
          return ["controller", "server"].includes(ctx.type);
        },
        task: () =>
          this.srcRenderService.render(
            integrationTemplate,
            {...ctx, relativeSrcPath},
            {
              output: `${symbolPath}.integration.spec.ts`,
              templateDir: TEMPLATE_DIR
            }
          )
      }
    ];
  }

  private mapOptions(options: GenerateCmdContext) {
    const type = [options.type, options.templateType].filter(Boolean).join(".");

    const specTemplate = this.srcRenderService.templateExists(`generate/${type}.spec.hbs`, {templateDir: TEMPLATE_DIR})
      ? `generate/${type}.spec.hbs`
      : "generate/generic.spec.hbs";

    const integrationTemplate = this.srcRenderService.templateExists(`generate/${type}.integration.hbs`, {templateDir: TEMPLATE_DIR})
      ? `generate/${type}.integration.hbs`
      : "generate/generic.integration.hbs";

    return {
      specTemplate,
      integrationTemplate,
      relativeSrcPath: normalizePath(this.srcRenderService.relativeFrom(`${options.symbolPath}.integration.spec.ts`))
    };
  }
}
