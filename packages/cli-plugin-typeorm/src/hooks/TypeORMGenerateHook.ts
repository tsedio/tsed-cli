import {FEATURES_TYPEORM_CONNECTION_TYPES, GenerateCmdContext, ProvidersInfoService} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, OnPrompt, ProjectPackageJson, SrcRendererService, Tasks} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {TEMPLATE_DIR} from "../utils/templateDir";

export interface TypeORMGenerateOptions extends GenerateCmdContext {
  typeormDataSource: string;
  datasourceName: string;
}

@Injectable()
export class TypeORMGenerateHook {
  @Inject()
  protected projectPackageJson: ProjectPackageJson;

  @Inject()
  protected srcRenderService: SrcRendererService;

  @Inject()
  protected cliDockerComposeYaml: CliDockerComposeYaml;

  constructor(private providersInfoService: ProvidersInfoService) {
    providersInfoService.add(
      {
        name: "TypeORM Datasource",
        value: "typeorm:datasource",
        model: "{{symbolName}}.datasource"
      },
      TypeORMGenerateHook
    );
  }

  @OnPrompt("generate")
  async onGeneratePrompt() {
    const list = FEATURES_TYPEORM_CONNECTION_TYPES.map((item) => {
      return {
        name: item.name,
        value: item.value.type
      };
    });

    return [
      {
        type: "autocomplete",
        name: "typeormDataSource",
        message: "Which database type?",
        when(state: any) {
          return state.type === "typeorm:datasource";
        },
        source: async (state: any, keyword: string) => {
          if (keyword) {
            return list.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
          }

          return list;
        }
      }
    ];
  }

  @OnExec("generate")
  onGenerateExec(ctx: TypeORMGenerateOptions): Tasks {
    if (this.providersInfoService.isMyProvider(ctx.type, TypeORMGenerateHook)) {
      return this.generateDataSourceTasks(ctx);
    }

    return [];
  }

  generateDataSourceTasks(ctx: TypeORMGenerateOptions) {
    const {typeormDataSource, symbolPath, name} = ctx;
    const connection = FEATURES_TYPEORM_CONNECTION_TYPES.find((item) => item.value.type === typeormDataSource);

    if (connection?.value?.dependencies) {
      this.projectPackageJson.addDependencies(connection?.value.dependencies || {});
    }

    const database = typeormDataSource.split(":").at(-1)!;

    return [
      {
        title: `Generate TypeORM connection file to '${symbolPath}.ts'`,
        task: () => {
          return this.srcRenderService.render(
            "datasource.hbs",
            {
              name,
              database,
              symbolName: ctx.symbolName.replace("Datasource", "DataSource")
            },
            {
              templateDir: TEMPLATE_DIR,
              output: `${ctx.symbolPath}.ts`,
              rootDir: this.srcRenderService.rootDir
            }
          );
        }
      },
      {
        title: "Generate docker-compose configuration",
        task: async () => this.cliDockerComposeYaml.addDatabaseService(name, database)
      }
    ];
  }
}
