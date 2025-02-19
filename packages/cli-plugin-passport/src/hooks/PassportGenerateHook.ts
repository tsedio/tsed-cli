import {type GenerateCmdContext, ProvidersInfoService, SrcRendererService} from "@tsed/cli";
import {inject, OnExec, OnPrompt, ProjectPackageJson, type Tasks} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {kebabCase} from "change-case";

import {PassportClient} from "../services/PassportClient.js";
import {TEMPLATE_DIR} from "../utils/templateDir.js";

export interface PassportGenerateOptions extends GenerateCmdContext {
  passportPackage: string;
}

@Injectable()
export class PassportGenerateHook {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected srcRenderService = inject(SrcRendererService);
  protected passportClient = inject(PassportClient);
  protected packages: any[];

  constructor(private providersInfoService: ProvidersInfoService) {
    providersInfoService.add(
      {
        name: "Protocol",
        value: "protocol",
        model: "{{symbolName}}.protocol"
      },
      PassportGenerateHook
    );
  }

  @OnPrompt("generate")
  async onGeneratePrompt() {
    this.packages = await this.passportClient.getPackages();

    const list = this.packages.map((item) => {
      return {
        name: `${item.name} - ${item.description}`,
        value: item.name
      };
    });

    return [
      {
        type: "autocomplete",
        name: "passportPackage",
        message: "Which passport package ?",
        when(state: any) {
          return ["protocol"].includes(state.type);
        },
        source: (state: any, keyword: string) => {
          if (keyword) {
            return list.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
          }

          return list;
        }
      }
    ];
  }

  @OnExec("generate")
  onGenerateExec(ctx: PassportGenerateOptions): Tasks {
    if (this.providersInfoService.isMyProvider(ctx.type, PassportGenerateHook)) {
      ctx = this.mapOptions(ctx);
      const {passportPackage, symbolPath} = ctx;

      this.projectPackageJson.addDependency(ctx.passportPackage, this.getPassportPackageVersion(passportPackage));

      return [
        {
          title: `Generate ${ctx.type} file to '${symbolPath}.ts'`,
          task: () =>
            this.srcRenderService.render(this.getTemplate(passportPackage), ctx, {
              output: `${symbolPath}.ts`,
              templateDir: TEMPLATE_DIR
            })
        }
      ];
    }

    return [];
  }

  private mapOptions(options: PassportGenerateOptions) {
    return {
      ...options,
      protocolName: kebabCase(options.name),
      passportPackage: options.passportPackage
    };
  }

  private getTemplate(passportPackage: string) {
    const template = `${passportPackage}.protocol.hbs`;

    return this.srcRenderService.templateExists(template, {templateDir: TEMPLATE_DIR}) ? template : "generic.protocol.hbs";
  }

  private getPassportPackageVersion(passportPackage: string) {
    const passportPkgDetails = this.packages.find((pkg) => pkg.name === passportPackage);

    return passportPkgDetails ? passportPkgDetails["dist-tags"]?.latest : undefined;
  }
}
