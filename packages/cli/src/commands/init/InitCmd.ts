import {
  CliExeca,
  CliFs,
  CliLoadFile,
  CliPackageJson,
  CliPlugins,
  CliService,
  Command,
  CommandProvider,
  Configuration,
  createSubTasks,
  createTasksRunner,
  Inject,
  PackageManager,
  ProjectPackageJson,
  QuestionOptions,
  RootRendererService
} from "@tsed/cli-core";
import {paramCase, pascalCase} from "change-case";
import {basename, join} from "path";
import {DEFAULT_TSED_TAGS} from "../../constants";
import {ArchitectureConvention} from "../../interfaces/ArchitectureConvention";
import {ProjectConvention} from "../../interfaces/ProjectConvention";
import {OutputFilePathPipe} from "../../pipes/OutputFilePathPipe";
import {InitCmdContext} from "./interfaces/InitCmdContext";
import {InitFileSchema} from "./config/InitFileSchema";
import {mapToContext} from "./mappers/mapToContext";
import {FeaturesMap, FeatureType} from "./config/FeaturesPrompt";
import {InitOptions} from "./interfaces/InitOptions";
import {getFeaturesPrompt} from "./prompts/getFeaturesPrompt";
import {PlatformType} from "../../interfaces";
import {fillImports} from "../../utils/fillImports";

@Command({
  name: "init",
  description: "Init a new Ts.ED project",
  args: {
    root: {
      type: String,
      defaultValue: ".",
      description: "Root directory to initialize the Ts.ED project"
    }
  },
  options: {
    "-n, --project-name <projectName>": {
      type: String,
      defaultValue: "",
      description: "Set the project name. By default, the project is the same as the name directory."
    },
    "-a, --arch <architecture>": {
      type: String,
      defaultValue: ArchitectureConvention.DEFAULT,
      description: `Set the default architecture convention (${ArchitectureConvention.DEFAULT} or ${ArchitectureConvention.FEATURE})`
    },
    "-c, --convention <convention>": {
      type: String,
      defaultValue: ProjectConvention.DEFAULT,
      description: `Set the default project convention (${ArchitectureConvention.DEFAULT} or ${ArchitectureConvention.FEATURE})`
    },
    "-p, --platform <platform>": {
      type: String,
      defaultValue: PlatformType.EXPRESS,
      description: "Set the default platform for Ts.ED (express or koa)"
    },
    "--features <features...>": {
      type: Array,
      itemType: String,
      defaultValue: [],
      description: "List of the Ts.ED features."
    },
    "-m, --package-manager <packageManager>": {
      itemType: String,
      defaultValue: PackageManager.YARN,
      description: "The default package manager to install the project"
    },
    "-t, --tsed-version <version>": {
      type: String,
      defaultValue: DEFAULT_TSED_TAGS,
      description: "Use a specific version of Ts.ED (format: 5.x.x)."
    },
    "-f, --file <path>": {
      type: String,
      description: "Location of a file in which the features are defined."
    },
    "-s, --skip-prompt": {
      type: Boolean,
      defaultValue: false,
      description: "Skip the prompt."
    }
  }
})
export class InitCmd implements CommandProvider {
  @Configuration()
  protected configuration: Configuration;

  @Inject()
  protected cliPlugins: CliPlugins;

  @Inject()
  protected packageJson: ProjectPackageJson;

  @CliPackageJson()
  protected cliPackageJson: CliPackageJson;

  @Inject()
  protected cliService: CliService;

  @Inject()
  protected cliLoadFile: CliLoadFile;

  @Inject()
  protected rootRenderer: RootRendererService;

  @Inject()
  protected outputFilePathPipe: OutputFilePathPipe;

  @Inject()
  protected execa: CliExeca;

  @Inject()
  protected fs: CliFs;

  async $beforePrompt(initialOptions: Partial<InitOptions>) {
    if (initialOptions.file) {
      const file = join(this.packageJson.dir, initialOptions.file);

      return {
        ...initialOptions,
        ...(await this.cliLoadFile.loadFile(file, InitFileSchema))
      };
    }

    return initialOptions;
  }

  $prompt(initialOptions: Partial<InitOptions>): QuestionOptions {
    if (initialOptions.skipPrompt) {
      return [];
    }

    return [
      {
        type: "input",
        name: "projectName",
        message: "What is your project name",
        default: paramCase(initialOptions.root!),
        when: initialOptions.root !== ".",
        transformer(input) {
          return paramCase(input);
        }
      },
      ...getFeaturesPrompt(initialOptions)
    ];
  }

  $mapContext(ctx: any): InitCmdContext {
    this.resolveRootDir(ctx);
    ctx = mapToContext(ctx);

    return fillImports({
      ...ctx,
      cliVersion: ctx.cliVersion || this.cliPackageJson.version,
      srcDir: this.configuration.project?.srcDir,
      platformSymbol: ctx.platform && pascalCase(`Platform ${ctx.platform}`)
    }) as InitCmdContext;
  }

  async $beforeExec(ctx: InitCmdContext): Promise<any> {
    this.fs.ensureDirSync(this.packageJson.dir);
    this.packageJson.name = ctx.projectName;

    ctx.packageManager && this.packageJson.setPreference("packageManager", ctx.packageManager);
    ctx.architecture && this.packageJson.setPreference("architecture", ctx.architecture);
    ctx.convention && this.packageJson.setPreference("convention", ctx.convention);
    ctx.GH_TOKEN && this.packageJson.setGhToken(ctx.GH_TOKEN);

    this.addDependencies(ctx);
    this.addDevDependencies(ctx);
    this.addScripts(ctx);
    this.addFeatures(ctx);

    await createTasksRunner(
      [
        {
          title: "Write RC files",
          skip: () => !ctx.GH_TOKEN,
          task: () =>
            this.rootRenderer.renderAll(["/init/.npmrc.hbs", "/init/.yarnrc.hbs"], ctx, {
              baseDir: "/init"
            })
        },
        {
          title: "Install plugins",
          task: createSubTasks(() => this.packageJson.install(ctx), {...ctx, concurrent: false})
        },
        {
          title: "Load plugins",
          task: () => this.cliPlugins.loadPlugins()
        },
        {
          title: "Install plugins dependencies",
          task: createSubTasks(this.cliPlugins.addPluginsDependencies(ctx), {...ctx, concurrent: false})
        }
      ],
      ctx
    );
  }

  async $exec(ctx: InitCmdContext) {
    InitCmd.checkPrecondition(ctx);

    const subTasks = [
      ...(await this.cliService.getTasks("generate", {
        ...ctx,
        type: "server",
        name: "Server",
        route: "/rest"
      })),
      ...(await this.cliService.getTasks("generate", {
        type: "controller",
        route: "hello-world",
        name: "HelloWorld",
        directory: "rest"
      })),
      ...(ctx.commands
        ? await this.cliService.getTasks("generate", {
            type: "command",
            route: "hello",
            name: "hello"
          })
        : [])
    ];

    const indexCtrlBaseName = basename(
      `${this.outputFilePathPipe.transform({
        name: "Index",
        type: "controller",
        format: ctx.convention
      })}.ts`
    );

    return [
      {
        title: "Generate project files",
        task: createSubTasks(
          [
            {
              title: "Root files",
              task: () =>
                this.rootRenderer.renderAll(
                  [
                    "/init/.dockerignore.hbs",
                    "/init/.gitignore.hbs",
                    "/init/.barrelsby.json.hbs",
                    "/init/processes.config.js.hbs",
                    ctx.babel && "/init/.babelrc.hbs",
                    ctx.webpack && "/init/webpack.config.js.hbs",
                    "/init/docker-compose.yml.hbs",
                    "/init/Dockerfile.hbs",
                    "/init/README.md.hbs",
                    "/init/tsconfig.compile.json.hbs",
                    "/init/tsconfig.json.hbs",
                    "/init/src/index.ts.hbs",
                    "/init/src/config/envs/index.ts.hbs",
                    "/init/src/config/logger/index.ts.hbs",
                    "/init/src/config/index.ts.hbs",
                    ctx.commands && "/init/src/bin/index.ts.hbs",
                    ctx.swagger && "/init/views/swagger.ejs.hbs",
                    ctx.swagger && {
                      path: "/init/src/controllers/pages/IndexController.ts.hbs",
                      basename: indexCtrlBaseName,
                      output: ctx.architecture === "default" ? "/controllers/pages/IndexController.ts" : "/pages/IndexController.ts"
                    }
                  ].filter(Boolean),
                  ctx,
                  {
                    baseDir: "/init"
                  }
                )
            },
            ...subTasks
          ],
          {...ctx, concurrent: false}
        )
      }
    ];
  }

  async $afterPostInstall() {
    return [
      {
        title: "Generate barrels files",
        task: () => {
          return this.packageJson.runScript("barrels", {
            ignoreError: true
          });
        }
      }
    ];
  }

  resolveRootDir(ctx: Partial<InitCmdContext>) {
    const rootDirName = paramCase(ctx.projectName || basename(this.packageJson.dir));

    if (this.packageJson.dir.endsWith(rootDirName)) {
      ctx.projectName = ctx.projectName || rootDirName;
      ctx.root = ".";
      return;
    }

    ctx.projectName = ctx.projectName || rootDirName;

    if (ctx.root && ctx.root !== ".") {
      this.packageJson.dir = join(this.packageJson.dir, rootDirName);
      ctx.root = ".";
    }
  }

  addScripts(ctx: InitCmdContext): void {
    const runner = this.packageJson.getRunCmd();

    this.packageJson.addScripts({
      build: `${runner} barrels && tsc --project tsconfig.compile.json`,
      barrels: "barrelsby --config .barrelsby.json",
      start: `${runner} barrels && tsnd --inspect --exit-child --cls --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts`,
      "start:prod": "cross-env NODE_ENV=production node dist/index.js"
    });

    if (ctx.babel) {
      this.packageJson.addScripts({
        build: `tsc && babel src --out-dir dist --extensions ".ts,.tsx" --source-maps inline`,
        start: "babel-watch --extensions .ts src/index.ts"
      });
    }

    if (ctx.webpack) {
      this.packageJson.addScripts({
        bundle: `tsc && cross-env NODE_ENV=production webpack`,
        "start:bundle": "cross-env NODE_ENV=production node dist/app.bundle.js"
      });
    }
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({
      "@tsed/common": ctx.tsedVersion,
      "@tsed/core": ctx.tsedVersion,
      "@tsed/di": ctx.tsedVersion,
      "@tsed/ajv": ctx.tsedVersion,
      "@tsed/exceptions": ctx.tsedVersion,
      "@tsed/schema": ctx.tsedVersion,
      "@tsed/json-mapper": ctx.tsedVersion,
      "@tsed/platform-cache": ctx.tsedVersion,
      "@tsed/platform-exceptions": ctx.tsedVersion,
      "@tsed/platform-log-middleware": ctx.tsedVersion,
      "@tsed/platform-middlewares": ctx.tsedVersion,
      "@tsed/platform-params": ctx.tsedVersion,
      "@tsed/platform-response-filter": ctx.tsedVersion,
      "@tsed/platform-views": ctx.tsedVersion,
      "@tsed/logger": "latest",
      "@tsed/logger-file": "latest",
      "@tsed/engines": "latest",
      ajv: "latest",
      barrelsby: "latest",
      "cross-env": "latest",
      dotenv: "latest",
      "dotenv-expand": "latest",
      "dotenv-flow": "latest"
    });
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        "@types/node": "latest",
        "@types/multer": "latest",
        tslib: "latest",
        "ts-node": "latest",
        "tsconfig-paths": "latest",
        typescript: "latest"
      },
      ctx
    );

    if (!ctx.babel) {
      this.packageJson.addDevDependencies(
        {
          "ts-node-dev": "latest"
        },
        ctx
      );
    }
  }

  addFeatures(ctx: InitCmdContext) {
    ctx.features.forEach((value) => {
      const feature = FeaturesMap[value.toLowerCase()];

      if (feature.dependencies) {
        this.packageJson.addDependencies(feature.dependencies, ctx);
      }

      if (feature.devDependencies) {
        this.packageJson.addDevDependencies(feature.devDependencies, ctx);
      }
    });

    switch (ctx.platform) {
      case "express":
        this.addExpressDependencies(ctx);
        break;
      case "koa":
        this.addKoaDependencies(ctx);
        break;
    }

    if (ctx.features.find((value) => value === FeatureType.GRAPHQL)) {
      this.packageJson.addDependencies(
        {
          ["apollo-server-" + ctx.platform]: "2.25.2"
        },
        ctx
      );
    }
  }

  private addExpressDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies(
      {
        "@tsed/platform-express": ctx.tsedVersion,
        "body-parser": "latest",
        cors: "latest",
        compression: "latest",
        "cookie-parser": "latest",
        express: "latest",
        "method-override": "latest"
      },
      ctx
    );

    this.packageJson.addDevDependencies(
      {
        "@types/cors": "latest",
        "@types/express": "latest",
        "@types/compression": "latest",
        "@types/cookie-parser": "latest",
        "@types/method-override": "latest"
      },
      ctx
    );
  }

  private addKoaDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies(
      {
        "@tsed/platform-koa": ctx.tsedVersion,
        koa: "latest",
        "@koa/cors": "latest",
        "@koa/router": "latest",
        "koa-qs": "latest",
        "koa-bodyparser": "latest",
        "koa-override": "latest",
        "koa-compress": "latest"
      },
      ctx
    );

    this.packageJson.addDevDependencies(
      {
        "@types/koa": "latest",
        "@types/koa-qs": "latest",
        "@types/koa-json": "latest",
        "@types/koa-bodyparser": "latest",
        "@types/koa__router": "latest",
        "@types/koa-compress": "latest",
        "@types/koa-send": "latest",
        "@types/koa__cors": "latest"
      },
      ctx
    );
  }

  static checkPrecondition(ctx: InitCmdContext) {
    const isValid = (types: any, value: any) => (value ? Object.values(types).includes(value) : true);

    if (!isValid(PlatformType, ctx.platform)) {
      throw new Error(`Invalid selected platform: ${ctx.platform}. Possible values: ${Object.values(PlatformType).join(", ")}.`);
    }

    if (!isValid(ArchitectureConvention, ctx.architecture)) {
      throw new Error(
        `Invalid selected architecture: ${ctx.architecture}. Possible values: ${Object.values(ArchitectureConvention).join(", ")}.`
      );
    }

    if (!isValid(ProjectConvention, ctx.convention)) {
      throw new Error(`Invalid selected convention: ${ctx.convention}. Possible values: ${Object.values(ProjectConvention).join(", ")}.`);
    }

    if (!isValid(PackageManager, ctx.packageManager)) {
      throw new Error(
        `Invalid selected package manager: ${ctx.packageManager}. Possible values: ${Object.values(PackageManager).join(", ")}.`
      );
    }

    if (ctx.features) {
      ctx.features.forEach((value) => {
        const feature = FeaturesMap[value.toLowerCase()];

        if (!feature) {
          throw new Error(`Invalid selected feature: ${value}. Possible values: ${Object.values(FeatureType).join(", ")}.`);
        }
      });
    }
  }
}
