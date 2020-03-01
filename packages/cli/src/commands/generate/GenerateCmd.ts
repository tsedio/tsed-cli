import {Command, ICommand, QuestionOptions, RenderService} from "@tsed/cli-core";
import {paramCase, pascalCase} from "change-case";
import {basename, dirname, join} from "path";

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
          },
          {
            name: "Protocol with @tsed/passport",
            value: "protocol"
          }
        ]
      },
      {
        type: "input",
        name: "name",
        message: "Which name ?",
        default: initialOptions.name,
        when: !initialOptions.name
      },
      {
        type: "input",
        name: "route",
        message: "Which route ?",
        when(state: any) {
          return state.type === "controller";
        },
        default(state: IGenerateCmdOptions) {
          return `/${paramCase(state.name)}`;
        }
      }
    ];
  }

  async $exec(options: IGenerateCmdOptions): Promise<void> {
    const {outputFile, ...data} = this.mapOptions(options);

    await this.renderService.render(`generate/${options.type}.hbs`, data, outputFile);
  }

  mapOptions(options: IGenerateCmdOptions) {
    const name = basename(options.name);
    const dir = dirname(options.name);
    const className = pascalCase(name + " " + options.type);

    return {
      route: options.route
        ?.split("/")
        .map(v => paramCase(v))
        .join("/"),
      className,
      outputFile: join(dir, `${options.type}s`, `${className}.ts`)
    };
  }
}
