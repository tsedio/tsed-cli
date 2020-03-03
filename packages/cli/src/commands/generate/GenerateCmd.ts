import {ClassNamePipe, Command, ICommand, OutputFilePathPipe, QuestionOptions, RenderService, RoutePipe} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {pascalCase} from "change-case";

export interface IGenerateCmdOptions {
  type: string;
  name: string;
  route?: string;
}

@Command({
  name: "generate",
  description: "Generate a new provider class",
  args: {
    type: {
      description: "Type of the provider (Injectable, Controller, Pipe, etc...)",
      type: String
    },
    name: {
      description: "Name of the class",
      type: String
    }
  }
})
export class GenerateCmd implements ICommand {
  @Inject(ClassNamePipe)
  classNamePipe: ClassNamePipe;

  @Inject(OutputFilePathPipe)
  outputFilePathPipe: OutputFilePathPipe;

  @Inject(RoutePipe)
  routePipe: RoutePipe;

  constructor(private renderService: RenderService) {}

  $prompt(initialOptions: any): QuestionOptions {
    return [
      {
        type: "list",
        name: "type",
        message: "Which type of provider ?",
        default: initialOptions.type,
        when: !initialOptions.type,
        choices: [
          {
            name: "Controller",
            value: "controller"
          },
          {
            name: "Middleware",
            value: "middleware"
          },
          {
            name: "Injectable",
            value: "injectable"
          },
          {
            name: "Model",
            value: "model"
          },
          {
            name: "Decorator",
            value: "decorator"
          },
          {
            name: "Module",
            value: "module"
          },
          {
            name: "Pipe",
            value: "pipe"
          },
          {
            name: "Interceptor",
            value: "interceptor"
          },
          {
            name: "Server",
            value: "server"
          }
        ]
      },
      {
        type: "input",
        name: "name",
        message: "Which name ?",
        default: (state: any) => initialOptions.name || pascalCase(state.type),
        when: !initialOptions.name
      },
      {
        type: "input",
        name: "route",
        message: "Which route ?",
        when(state: any) {
          return ["controller", "server"].includes(state.type);
        },
        default: (state: IGenerateCmdOptions) => {
          return state.type === "server" ? "/rest" : this.routePipe.transform(state.name);
        }
      }
    ];
  }

  async $exec(options: IGenerateCmdOptions) {
    const {outputFile, ...data} = this.mapOptions(options);

    return [
      {
        title: `Generate ${options.type} file to '${outputFile}'`,
        task: () => this.renderService.render(`generate/${options.type}.hbs`, data, outputFile)
      }
    ];
  }

  mapOptions(options: IGenerateCmdOptions) {
    return {
      route: options.route ? this.routePipe.transform(options.route) : "",
      className: this.classNamePipe.transform(options),
      outputFile: `${this.outputFilePathPipe.transform(options)}.ts`
    };
  }
}
