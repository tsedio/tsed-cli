import {type CliDefaultOptions, Command, type CommandProvider, Inject, ProjectPackageJson, SrcRendererService} from "@tsed/cli-core";
import {normalizePath} from "@tsed/normalize-path";
import {kebabCase, pascalCase} from "change-case";
import {globbySync} from "globby";
import {basename, dirname, join} from "path";

import {ProjectConvention} from "../../interfaces/ProjectConvention.js";
import {ClassNamePipe} from "../../pipes/ClassNamePipe.js";
import {OutputFilePathPipe} from "../../pipes/OutputFilePathPipe.js";
import {RoutePipe} from "../../pipes/RoutePipe.js";
import {ProvidersInfoService} from "../../services/ProvidersInfoService.js";
import {fillImports} from "../../utils/fillImports.js";
import {PROVIDER_TYPES} from "./ProviderTypes.js";

export interface GenerateCmdContext extends CliDefaultOptions {
  type: string;
  name: string;
  route: string;
  directory: string;
  platform: string;
  templateType: string;
  middlewarePosition: "before" | "after";
  symbolName: string;
  symbolPath: string;
  symbolPathBasename: string;
  convention: ProjectConvention;
}

const DECORATOR_TYPES = [
  {name: "Class decorator", value: "class"},
  {name: "Ts.ED middleware and its decorator", value: "middleware"},
  {name: "Ts.ED endpoint decorator", value: "endpoint"},
  {name: "Ts.ED property decorator", value: "prop"},
  {name: "Ts.ED parameter decorator", value: "param"},
  {name: "Vanilla Method decorator", value: "method"},
  {name: "Vanilla Property decorator", value: "property"},
  {name: "Vanilla Parameter decorator", value: "parameter"},
  {name: "Generic decorator", value: "generic"}
];

const searchFactory = (list: any) => {
  return (state: any, keyword: string) => {
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
  },
  options: {
    "-r, --route <route>": {
      type: String,
      description: "The route for the controller generated file"
    },
    "-d, --directory <directory>": {
      description: "Directory where the file must be generated",
      type: String
    },
    "-t, --template-type <templateType>": {
      description: "Directory where the file must be generated",
      type: String
    },
    "-m, --middleware-position <templateType>": {
      description: "Middleware position (before, after)",
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

  @Inject()
  projectPackageJson: ProjectPackageJson;

  constructor(private providersList: ProvidersInfoService) {
    PROVIDER_TYPES.forEach((info) => {
      this.providersList.add(
        {
          ...info
        },
        GenerateCmd
      );
    });
  }

  $prompt(initialOptions: Partial<GenerateCmdContext>) {
    const getName = (state: any) =>
      initialOptions.name || pascalCase(state.name || initialOptions.name || state.type || initialOptions.type);

    const proposedProviders = this.providersList.findProviders(initialOptions.type);

    return [
      {
        type: "autocomplete",
        name: "type",
        message: "Which type of provider?",
        default: initialOptions.type,
        when: () => proposedProviders.length > 1,
        source: searchFactory(proposedProviders)
      },
      {
        type: "input",
        name: "name",
        message: "Which name?",
        default: getName,
        when: !initialOptions.name
      },
      {
        message: "Which platform?",
        type: "list",
        name: "platform",
        when(state: any) {
          return ["server"].includes(state.type || initialOptions.type);
        },
        choices: [
          {
            name: "Express.js",
            checked: true,
            value: "express"
          },
          {
            name: "Koa.js",
            checked: false,
            value: "koa"
          }
        ]
      },
      {
        type: "input",
        name: "route",
        message: "Which route?",
        when(state: any) {
          return !!(["controller", "server"].includes(state.type || initialOptions.type) || initialOptions.route);
        },
        default: (state: GenerateCmdContext) => {
          return state.type === "server" ? "/rest" : this.routePipe.transform(getName(state));
        }
      },
      {
        type: "list",
        name: "directory",
        message: "Which directory?",
        when(state: any) {
          return ["controller"].includes(state.type || initialOptions.type) || initialOptions.directory;
        },
        choices: this.getDirectories("controllers")
      },
      {
        type: "autocomplete",
        name: "templateType",
        message: (state: any) => `Which type of ${state.type || initialOptions.type}?`,
        when(state: any) {
          return !!(["decorator"].includes(state.type || initialOptions.type) || initialOptions.templateType);
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
          return !!(
            (["decorator"].includes(state.type || initialOptions.type) && ["middleware"].includes(state.templateType)) ||
            initialOptions.middlewarePosition
          );
        }
      }
    ];
  }

  $mapContext(ctx: Partial<GenerateCmdContext>): GenerateCmdContext {
    const {name = ""} = ctx;
    let {type = ""} = ctx;
    type = type.toLowerCase();

    if (ctx.name === "prisma" && ctx.name) {
      type = "prisma.service";
    }

    const symbolName = this.classNamePipe.transform({name, type, format: ProjectConvention.DEFAULT});
    const symbolParamName = kebabCase(symbolName);

    return fillImports({
      ...ctx,
      type,
      route: ctx.route ? this.routePipe.transform(ctx.route) : "",
      symbolName,
      symbolParamName,
      symbolPath: normalizePath(
        this.outputFilePathPipe.transform({
          name,
          type,
          subDir: ctx.directory
        })
      ),
      symbolPathBasename: normalizePath(this.classNamePipe.transform({name, type})),
      platformSymbol: ctx.platform && pascalCase(`Platform ${ctx.platform}`)
    }) as GenerateCmdContext;
  }

  $exec(ctx: GenerateCmdContext) {
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
        },
        {
          title: `Update bin/index`,
          skip() {
            return ctx.type !== "command";
          },
          task: () => {
            return this.srcRenderService.update("bin/index.ts", [
              {
                type: "import",
                content: `import {${ctx.symbolName}} from "./${basename(symbolPath)}.js";`
              },
              {
                type: "insert-after",
                pattern: /commands: \[/,
                content: `  ${ctx.symbolName}`
              }
            ]);
          }
        }
      ];
    }

    return [];
  }

  getDirectories(dir: string) {
    const directories = globbySync("**/*", {
      cwd: join(this.srcRenderService.rootDir, dir),
      ignore: ["__*"]
    });

    const set = new Set(
      directories.map((dir) => {
        return dirname(dir);
      })
    );

    set.delete(".");

    return [...set];
  }
}
