import {IGenerateCmdOptions} from "@tsed/cli";
import {ClassNamePipe, OnExec, OutputFilePathPipe, RenderService, RoutePipe} from "@tsed/cli-core";
import {Tasks} from "@tsed/cli-core/src/interfaces/Tasks";
import {Inject, Module} from "@tsed/di";
import {resolve} from "path";

const TEMPLATE_DIR = resolve(__dirname, "..", "templates");

@Module({
  imports: []
})
export class CliPluginMochaModule {
  @Inject(ClassNamePipe)
  classNamePipe: ClassNamePipe;

  @Inject(OutputFilePathPipe)
  outputFilePathPipe: OutputFilePathPipe;

  @Inject(RoutePipe)
  routePipe: RoutePipe;

  renderService: RenderService;

  constructor(renderService: RenderService) {
    this.renderService = renderService.createRenderer(TEMPLATE_DIR);
  }

  @OnExec("generate")
  onGenerateExec(options: IGenerateCmdOptions): Tasks {
    const {outputFile, ...data} = this.mapOptions(options);

    const integrationTemplate = options.type === "server" ? "server.integration.hbs" : "generic.integration.hbs";
    const specTemplate = "generic.spec.hbs";

    return [
      {
        title: `Generate ${options.type} spec file to '${outputFile}.spec.ts'`,
        enabled() {
          return options.type !== "server";
        },
        task: () => this.renderService.render(specTemplate, data, `${outputFile}.spec.ts`)
      },
      {
        title: `Generate ${options.type} integration file '${outputFile}.integration.spec.ts'`,
        enabled() {
          return ["controller", "server"].includes(options.type);
        },
        task: () => this.renderService.render(integrationTemplate, data, `${outputFile}.integration.spec.ts`)
      }
    ];
  }

  mapOptions(options: IGenerateCmdOptions) {
    return {
      route: options.route ? this.routePipe.transform(options.route) : "",
      className: this.classNamePipe.transform(options),
      outputFile: this.outputFilePathPipe.transform(options)
    };
  }
}
