import {FeaturesMap, GenerateCmdContext, ProvidersInfoService} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, OnPrompt, ProjectPackageJson, SrcRendererService, Tasks} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {constantCase} from "change-case";
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
  onGeneratePrompt() {
    const list = this.getTypeORMTypes().map(([value, {name}]) => {
      return {
        name: name,
        value: value
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
  onGenerateExec(ctx: TypeORMGenerateOptions): Tasks {
    if (this.providersInfoService.isMyProvider(ctx.type, TypeORMGenerateHook)) {
      return this.generateDataSourceTasks(ctx);
    }

    return [];
  }

  getTypeORMTypes() {
    return Object.entries(FeaturesMap).filter(([value]) => value.startsWith("typeorm:"));
  }

  generateDataSourceTasks(ctx: TypeORMGenerateOptions) {
    const {typeormDataSource, symbolPath, name} = ctx;

    if (!typeormDataSource) {
      return [];
    }

    this.getTypeORMTypes()
      .filter(([value]) => value === typeormDataSource)
      .forEach(([, feature]) => {
        if (feature.dependencies) {
          this.projectPackageJson.addDependencies(feature.dependencies);
        }
        if (feature.devDependencies) {
          this.projectPackageJson.addDependencies(feature.devDependencies);
        }
      });

    const database = typeormDataSource.split(":").at(-1)!;

    const symbolName = ctx.symbolName.replace("Datasource", "DataSource");

    return [
      {
        title: `Generate TypeORM datasource file to '${symbolPath}.ts'`,
        task: () =>
          this.srcRenderService.render(
            "datasource.hbs",
            {
              name,
              database,
              symbolName,
              tokenName: constantCase(symbolName)
            },
            {
              templateDir: TEMPLATE_DIR,
              output: `${ctx.symbolPath}.ts`,
              rootDir: this.srcRenderService.rootDir
            }
          )
      },
      {
        title: "Generate docker-compose configuration",
        task: () => this.cliDockerComposeYaml.addDatabaseService(name, database)
      }
    ];
  }
}
