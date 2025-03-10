import {type GenerateCmdContext, ProvidersInfoService, SrcRendererService} from "@tsed/cli";
import {CliDockerComposeYaml, inject, OnExec, ProjectPackageJson, type Tasks} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {camelCase, kebabCase} from "change-case";
// @ts-ignore
import {plural} from "pluralize";

import {CliMongoose} from "../services/CliMongoose.js";
import {TEMPLATE_DIR} from "../utils/templateDir.js";

@Injectable()
export class MongooseGenerateHook {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected srcRenderService = inject(SrcRendererService);
  protected cliMongoose = inject(CliMongoose);
  protected packages: any[];
  protected cliDockerComposeYaml = inject(CliDockerComposeYaml);

  constructor(private providersInfoService: ProvidersInfoService) {
    providersInfoService
      .add(
        {
          name: "Mongoose model",
          value: "mongoose:model",
          model: "{{symbolName}}.model",
          baseDir: "models"
        },
        MongooseGenerateHook
      )
      .add(
        {
          name: "Mongoose schema",
          value: "mongoose:schema",
          model: "{{symbolName}}.schema",
          baseDir: "models"
        },
        MongooseGenerateHook
      )
      .add(
        {
          name: "Mongoose connection",
          value: "mongoose:connection"
        },
        MongooseGenerateHook
      );
  }

  @OnExec("generate")
  onGenerateExec(ctx: GenerateCmdContext): Tasks {
    if (this.providersInfoService.isMyProvider(ctx.type, MongooseGenerateHook)) {
      switch (ctx.type) {
        case "mongoose:connection":
          return this.generateConnection(ctx);
        case "mongoose:model":
        case "mongoose:schema":
          return this.generateTemplate(ctx);
      }
    }

    return [];
  }

  private generateTemplate(ctx: GenerateCmdContext) {
    const {symbolPath, type, symbolName} = ctx;
    const template = `mongoose.${type.split(":")[1]}.hbs`;
    const newCtx = {
      ...ctx,
      collectionName: plural(camelCase(symbolName.replace(/Schema|Model/gi, "")))
    };

    return [
      {
        title: `Generate ${ctx.type} file to '${symbolPath}.ts'`,
        task: () =>
          this.srcRenderService.render(template, newCtx, {
            output: `${symbolPath}.ts`,
            templateDir: TEMPLATE_DIR
          })
      }
    ];
  }

  private generateConnection(ctx: GenerateCmdContext) {
    return [
      {
        title: `Generate Mongoose configuration file to '${kebabCase(ctx.name)}.config.ts'`,
        task: () => this.cliMongoose.writeConfig(ctx.name, ctx)
      },
      {
        title: "Generate docker-compose configuration",
        task: () => this.cliDockerComposeYaml.addDatabaseService(ctx.name, "mongodb")
      }
    ];
  }
}
