import {Command, ICommand, Inject, SrcRendererService} from "@tsed/cli-core";
import {pascalCase} from "change-case";
import {ClassNamePipe} from "../../pipes/ClassNamePipe";
import {OutputFilePathPipe} from "../../pipes/OutputFilePathPipe";
import {RoutePipe} from "../../pipes/RoutePipe";
import {ProvidersInfoService} from "../../services/ProvidersInfoService";
import {PROVIDER_TYPES} from "./ProviderTypes";

export interface IGenerateCmdContext {
  type: string;
  name: string;
  route: string;
  templateType: string;
  symbolName: string;
  symbolPath: string;
}

const DECORATOR_TYPES = [
  {name: "Class decorator", value: "class"},
  {name: "Ts.ED endpoint decorator", value: "endpoint"},
  {name: "Ts.ED property decorator", value: "prop"},
  {name: "Ts.ED parameter decorator", value: "param"},
  {name: "Vanilla Method decorator", value: "method"},
  {name: "Vanilla Property decorator", value: "property"},
  {name: "Vanilla Parameter decorator", value: "parameter"}
];

const searchFactory = (list: any) => {
  return async (state: any, keyword: string) => {
    if (keyword) {
      return list.filter((item: any) => item.name.toLowerCase().includes(keyword.toLowerCase()));
    }

    return list;
  };
};

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
  @Inject()
  classNamePipe: ClassNamePipe;

  @Inject()
  outputFilePathPipe: OutputFilePathPipe;

  @Inject()
  routePipe: RoutePipe;

  @Inject()
  srcRenderService: SrcRendererService;

  constructor(private providersList: ProvidersInfoService) {
    PROVIDER_TYPES.forEach(info => {
      this.providersList.add(
        {
          ...info
        },
        GenerateCmd
      );
    });
  }

  $prompt(initialOptions: Partial<IGenerateCmdContext>) {
    const providers = this.providersList.toArray();

    return [
      {
        type: "autocomplete",
        name: "type",
        message: "Which type of provider ?",
        default: initialOptions.type,
        when: !initialOptions.type,
        source: searchFactory(providers)
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
        default: (state: IGenerateCmdContext) => {
          return state.type === "server" ? "/rest" : this.routePipe.transform(state.name);
        }
      },
      {
        type: "autocomplete",
        name: "templateType",
        message: (state: any) => `Which type of ${state.type}?`,
        when(state: any) {
          return ["decorator"].includes(state.type);
        },
        source: searchFactory(DECORATOR_TYPES)
      }
    ];
  }

  $mapContext(ctx: Partial<IGenerateCmdContext>): IGenerateCmdContext {
    const {name = "", type = ""} = ctx;

    const file = this.outputFilePathPipe.transform({name, type});

    return {
      ...ctx,
      route: ctx.route ? this.routePipe.transform(ctx.route) : "",
      symbolName: this.classNamePipe.transform({name, type}),
      symbolPath: file
    } as IGenerateCmdContext;
  }

  async $exec(options: IGenerateCmdContext) {
    const {symbolPath, ...data} = options;

    if (this.providersList.isMyProvider(options.type, GenerateCmd)) {
      const type = [options.type, options.templateType].filter(Boolean).join(".");
      const template = `generate/${type}.hbs`;

      return [
        {
          title: `Generate ${options.type} file to '${symbolPath}.ts'`,
          task: () =>
            this.srcRenderService.render(template, data, {
              output: `${symbolPath}.ts`
            })
        }
      ];
    }

    return [];
  }
}
