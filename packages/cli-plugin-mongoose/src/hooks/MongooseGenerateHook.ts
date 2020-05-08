import {GenerateCmdContext, ProvidersInfoService} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, ProjectPackageJson, SrcRendererService, Tasks} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {paramCase} from "change-case";
import {CliMongoose} from "../services/CliMongoose";

@Injectable()
export class MongooseGenerateHook {
  @Inject()
  projectPackageJson: ProjectPackageJson;

  @Inject()
  srcRenderService: SrcRendererService;

  @Inject()
  cliMongoose: CliMongoose;

  packages: any[];
  @Inject()
  protected cliDockerComposeYaml: CliDockerComposeYaml;

  constructor(private providersInfoService: ProvidersInfoService) {
    providersInfoService.add(
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
      return [
        {
          title: `Generate Mongoose configuration file to '${paramCase(ctx.name)}.config.ts'`,
          task: () => this.cliMongoose.writeConfig(ctx.name, ctx)
        },
        {
          title: "Generate docker-compose configuration",
          task: async () => this.cliDockerComposeYaml.addDatabaseService(ctx.name, "mongodb")
        }
      ];
    }

    return [];
  }
}
