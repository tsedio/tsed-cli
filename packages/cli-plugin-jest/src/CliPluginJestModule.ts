import {ClassNamePipe, IGenerateCmdOptions, OutputFilePathPipe, RoutePipe} from "@tsed/cli";
import {Inject, Module, OnExec, RenderService, Tasks} from "@tsed/cli-core";
import {resolve} from "path";

const TEMPLATE_DIR = resolve(__dirname, "..", "templates");

@Module({
  imports: []
})
export class CliPluginJestModule {
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

    const type = [options.type, options.templateType].filter(Boolean).join(".");
    const specTemplate = this.renderService.templateExists(`${type}.spec.hbs`) ? `${type}.spec.hbs` : "generic.spec.hbs";
    const integrationTemplate = this.renderService.templateExists(`${type}.integration.hbs`)
      ? `${type}.integration.hbs`
      : "generic.integration.hbs";

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
      symbolName: this.classNamePipe.transform(options),
      outputFile: this.outputFilePathPipe.transform(options)
    };
  }
}
