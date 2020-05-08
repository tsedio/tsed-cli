import {Command, CliDefaultOptions, CommandProvider, Inject, SrcRendererService} from "@tsed/cli-core";
import {pascalCase} from "change-case";
import {ClassNamePipe} from "../../pipes/ClassNamePipe";
import {OutputFilePathPipe} from "../../pipes/OutputFilePathPipe";
import {RoutePipe} from "../../pipes/RoutePipe";
import {ProvidersInfoService} from "../../services/ProvidersInfoService";
import {PROVIDER_TYPES} from "./ProviderTypes";

export interface GenerateCmdContext extends CliDefaultOptions {
  type: string;
  name: string;
  route: string;
  templateType: string;
  symbolName: string;
  symbolPath: string;
  symbolPathBasename: string;
}

const DECORATOR_TYPES = [
  {name: "Class decorator", value: "class"},
  {name: "Ts.ED middleware and his decorator", value: "middleware"},
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
  alias: "g",
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
export class GenerateCmd implements CommandProvider {
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

  $prompt(initialOptions: Partial<GenerateCmdContext>) {
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
        default: (state: any) => {
          return initialOptions.name || pascalCase(state.type || initialOptions.type);
        },
        when: !initialOptions.name
      },
      {
        type: "input",
        name: "route",
        message: "Which route ?",
        when(state: any) {
          return ["controller", "server"].includes(state.type || initialOptions.type);
        },
        default: (state: GenerateCmdContext) => {
          return state.type === "server" ? "/rest" : this.routePipe.transform(state.name);
        }
      },
      {
        type: "autocomplete",
        name: "templateType",
        message: (state: any) => `Which type of ${state.type || initialOptions.type}?`,
        when(state: any) {
          return ["decorator"].includes(state.type || initialOptions.type);
        },
        source: searchFactory(DECORATOR_TYPES)
      },
      {
        type: "list",
        name: "middlewarePosition",
        message: () => `The middleware should be called:`,
        choices: [
          {name: "Before the endpoint", value: "before"},
          {name: "After the endpoint", value: "after"}
        ],
        when(state: any) {
          return ["decorator"].includes(state.type || initialOptions.type) && ["middleware"].includes(state.templateType);
        }
      }
    ];
  }

  $mapContext(ctx: Partial<GenerateCmdContext>): GenerateCmdContext {
    const {name = "", type = ""} = ctx;

    return {
      ...ctx,
      route: ctx.route ? this.routePipe.transform(ctx.route) : "",
      symbolName: this.classNamePipe.transform({name, type}),
      symbolPath: this.outputFilePathPipe.transform({name, type}),
      symbolPathBasename: this.classNamePipe.transform({name, type})
    } as GenerateCmdContext;
  }

  async $exec(ctx: GenerateCmdContext) {
    const {symbolPath} = ctx;

    if (this.providersList.isMyProvider(ctx.type, GenerateCmd)) {
      const type = [ctx.type, ctx.templateType].filter(Boolean).join(".");
      const template = `generate/${type}.hbs`;

      return [
        {
          title: `Generate ${ctx.type} file to '${symbolPath}.ts'`,
          task: () =>
            this.srcRenderService.render(template, ctx, {
              output: `${symbolPath}.ts`
            })
        }
      ];
    }

    return [];
  }
}
