import {ClassNamePipe, IGenerateCmdOptions, OutputFilePathPipe, ProvidersInfoService, RoutePipe} from "@tsed/cli";
import {Inject, Module, OnExec, OnPrompt, ProjectPackageJson, QuestionOptions, RenderService, Tasks} from "@tsed/cli-core";
import {paramCase} from "change-case";
import {resolve} from "path";
import {PassportClient} from "./services/PassportClient";

const TEMPLATE_DIR = resolve(__dirname, "..", "templates");

export interface IPassportGenerationOptions extends IGenerateCmdOptions {
  passportPackage: string;
}

@Module({
  imports: []
})
export class CliPluginPassport {
  @Inject(ClassNamePipe)
  classNamePipe: ClassNamePipe;

  @Inject(OutputFilePathPipe)
  outputFilePathPipe: OutputFilePathPipe;

  @Inject(RoutePipe)
  routePipe: RoutePipe;

  @Inject(ProjectPackageJson)
  projectPackageJson: ProjectPackageJson;

  renderService: RenderService;

  packages: any[];

  constructor(renderService: RenderService, private providersInfoService: ProvidersInfoService, private passportClient: PassportClient) {
    this.renderService = renderService.createRenderer(TEMPLATE_DIR);
    providersInfoService.add(
      {
        name: "Protocol",
        value: "protocol"
      },
      CliPluginPassport
    );
  }

  @OnPrompt("generate")
  async onGeneratePrompt(initialOption: IGenerateCmdOptions): Promise<QuestionOptions> {
    this.packages = await this.passportClient.getPackages();

    const list = this.packages.map(item => {
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
  onGenerateExec(options: IPassportGenerationOptions): Tasks {
    if (this.providersInfoService.isMyProvider(options.type, CliPluginPassport)) {
      const {outputFile, ...data} = this.mapOptions(options);
      const {passportPackage} = options;

      this.projectPackageJson.addDependency(options.passportPackage, this.getPassportPackageVersion(passportPackage));

      return [
        {
          title: `Generate ${options.type} file to '${outputFile}'`,
          task: () => this.renderService.render(this.getTemplate(passportPackage), data, outputFile)
        },
        {
          title: `Install passport package: ${options.passportPackage}`,
          task: () => {}
        }
      ];
    }

    return [];
  }

  mapOptions(options: IPassportGenerationOptions) {
    return {
      route: options.route ? this.routePipe.transform(options.route) : "",
      className: this.classNamePipe.transform(options),
      protocolName: paramCase(options.name),
      passportPackage: options.passportPackage,
      outputFile: this.outputFilePathPipe.transform(options) + ".ts"
    };
  }

  private getTemplate(passportPackage: string) {
    const template = `${passportPackage}.protocol.hbs`;

    return this.renderService.templateExists(template) ? template : "generic.protocol.hbs";
  }

  private getPassportPackageVersion(passportPackage: string) {
    const passportPkgDetails = this.packages.find(pkg => pkg.name === passportPackage);

    return passportPkgDetails ? passportPkgDetails["dist-tags"]?.latest : undefined;
  }
}
