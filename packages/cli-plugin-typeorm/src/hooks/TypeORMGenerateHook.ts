import {FEATURES_TYPEORM_CONNECTION_TYPES, IGenerateCmdContext, ProvidersInfoService} from "@tsed/cli";
import {Inject, OnExec, OnPrompt, ProjectPackageJson, QuestionOptions, SrcRendererService, Tasks} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {paramCase} from "change-case";
import {CliTypeORM} from "../services/CliTypeORM";

export interface ITypeORMGenerateOptions extends IGenerateCmdContext {
  typeormConnection: string;
  connectionName: string;
}

@Injectable()
export class TypeORMGenerateHook {
  @Inject()
  projectPackageJson: ProjectPackageJson;

  @Inject()
  srcRenderService: SrcRendererService;

  @Inject()
  cliTypeORM: CliTypeORM;

  packages: any[];

  constructor(private providersInfoService: ProvidersInfoService) {
    providersInfoService.add(
      {
        name: "TypeORM Connection",
        value: "typeorm:connection",
        model: "{{symbolName}}.connection"
      },
      TypeORMGenerateHook
    );
  }

  @OnPrompt("generate")
  async onGeneratePrompt(initialOption: IGenerateCmdContext): Promise<QuestionOptions> {
    const list = FEATURES_TYPEORM_CONNECTION_TYPES.map((item) => {
      return {
        name: item.name,
        value: item.value.type
      };
    });

    return [
      {
        type: "autocomplete",
        name: "typeormConnection",
        message: "Which passport package ?",
        when(state: any) {
          return ["typeorm:connection"].includes(state.type);
        },
        source: async (state: any, keyword: string) => {
          if (keyword) {
            return list.filter(item => item.name.toLowerCase().includes(keyword.toLowerCase()));
          }

          return list;
        }
      }
    ];
  }

  @OnExec("generate")
  onGenerateExec(ctx: ITypeORMGenerateOptions): Tasks {
    if (this.providersInfoService.isMyProvider(ctx.type, TypeORMGenerateHook)) {
      ctx = this.mapOptions(ctx);
      const {typeormConnection, symbolPath} = ctx;
      const connection = FEATURES_TYPEORM_CONNECTION_TYPES.find(item => item.value.type === typeormConnection);

      if (connection?.value?.dependencies) {
        this.projectPackageJson.addDependencies(connection?.value.dependencies || {});
      }

      return [
        {
          title: `Generate TypeORM connection file to '${symbolPath}.ts'`,
          task: () =>
            this.cliTypeORM.generateConnection(ctx.name, ctx)
        },
        {
          title: `Generate TypeORM configuration file to '${ctx.connectionName}.config.json'`,
          task: () =>
            this.cliTypeORM.writeOrmConfigTemplate(ctx.connectionName, ctx.typeormConnection.split(":")[1])
        }
      ];
    }

    return [];
  }

  private mapOptions(options: ITypeORMGenerateOptions) {
    return {
      ...options,
      connectionName: paramCase(options.name).replace("-connection", "")
    };
  }
}
