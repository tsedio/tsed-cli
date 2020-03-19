import {IGenerateCmdContext} from "@tsed/cli";
import {Inject, Injectable, OnExec, SrcRendererService, Tasks} from "@tsed/cli-core";
import {TEMPLATE_DIR} from "../utils/templateDir";

@Injectable()
export class JestGenerateHook {
  @Inject()
  srcRenderService: SrcRendererService;

  constructor() {}

  @OnExec("generate")
  onGenerateExec(ctx: IGenerateCmdContext): Tasks {
    const {outputFile, ...otherProps} = ctx;
    const {specTemplate, integrationTemplate} = this.mapOptions(ctx);

    return [
      {
        title: `Generate ${ctx.type} spec file to '${outputFile}.spec.ts'`,
        enabled() {
          return ctx.type !== "server";
        },
        task: () =>
          this.srcRenderService.render(specTemplate, otherProps, {
            output: `${outputFile}.spec.ts`,
            templateDir: TEMPLATE_DIR
          })
      },
      {
        title: `Generate ${ctx.type} integration file '${outputFile}.integration.spec.ts'`,
        enabled() {
          return ["controller", "server"].includes(ctx.type);
        },
        task: () =>
          this.srcRenderService.render(integrationTemplate, otherProps, {
            output: `${outputFile}.integration.spec.ts`,
            templateDir: TEMPLATE_DIR
          })
      }
    ];
  }

  private mapOptions(options: IGenerateCmdContext) {
    const type = [options.type, options.templateType].filter(Boolean).join(".");

    const specTemplate = this.srcRenderService.templateExists(`generate/${type}.spec.hbs`, {templateDir: TEMPLATE_DIR})
      ? `generate/${type}.spec.hbs`
      : "generate/generic.spec.hbs";

    const integrationTemplate = this.srcRenderService.templateExists(`generate/${type}.integration.hbs`, {templateDir: TEMPLATE_DIR})
      ? `generate/${type}.integration.hbs`
      : "generate/generic.integration.hbs";

    return {
      specTemplate,
      integrationTemplate
    };
  }
}
