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
  PackageManagersModule,
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
import {RuntimesModule} from "../../runtimes/RuntimesModule";
import {NodeRuntime} from "../../runtimes/supports/NodeRuntime";
import {BunRuntime} from "../../runtimes/supports/BunRuntime";
import {InitPlatformsModule} from "../../platforms/InitPlatformsModule";

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
    "--runtime <runtime>": {
      itemType: String,
      defaultValue: "node",
      description: "The default runtime used to run the project"
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
  },
  disableReadUpPkg: true
})
export class InitCmd implements CommandProvider {
  @Configuration()
  protected configuration: Configuration;

  @Inject()
  protected cliPlugins: CliPlugins;

  @Inject()
  protected packageJson: ProjectPackageJson;

  @Inject()
  protected packageManagers: PackageManagersModule;

  @Inject()
  protected runtimes: RuntimesModule;

  @Inject()
  protected platforms: InitPlatformsModule;

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

  checkPrecondition(ctx: InitCmdContext) {
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

    const runtimes = this.runtimes.list();
    if (!runtimes.includes(ctx.runtime)) {
      throw new Error(`Invalid selected runtime: ${ctx.runtime}. Possible values: ${runtimes.join(", ")}.`);
    }

    const managers = this.packageManagers.list();
    if (!managers.includes(ctx.packageManager)) {
      throw new Error(`Invalid selected package manager: ${ctx.packageManager}. Possible values: ${managers.join(", ")}.`);
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

    const packageManagers = this.packageManagers.list();
    const runtimes = this.runtimes.list();

    return [
      {
        type: "input",
        name: "projectName",
        message: "What is your project name",
        default: paramCase(initialOptions.root!),
        when: initialOptions.root !== ".",
        transformer(input: string) {
          return paramCase(input);
        }
      },
      ...getFeaturesPrompt(runtimes, packageManagers, initialOptions)
    ];
  }

  $mapContext(ctx: any): InitCmdContext {
    this.resolveRootDir(ctx);
    ctx = mapToContext(ctx);

    return fillImports({
      ...ctx,
      entryServer: ctx.convention !== ProjectConvention.ANGULAR ? "Server" : "server",
      yarn: PackageManager.YARN === ctx.packageManager || !ctx.packageManager,
      yarn_berry: ctx.packageManager === PackageManager.YARN_BERRY || !ctx.packageManager,
      npm: ctx.packageManager == PackageManager.NPM,
      pnpm: ctx.packageManager == PackageManager.PNPM,
      cliVersion: ctx.cliVersion || this.cliPackageJson.version,
      srcDir: this.configuration.project?.srcDir,
      platformSymbol: ctx.platform && pascalCase(`Platform ${ctx.platform}`)
    }) as InitCmdContext;
  }

  async $beforeExec(ctx: InitCmdContext): Promise<any> {
    this.fs.ensureDirSync(this.packageJson.dir);
    this.packageJson.name = ctx.projectName;

    ctx.packageManager && this.packageJson.setPreference("packageManager", ctx.packageManager);
    ctx.runtime && this.packageJson.setPreference("runtime", ctx.runtime);
    ctx.architecture && this.packageJson.setPreference("architecture", ctx.architecture);
    ctx.convention && this.packageJson.setPreference("convention", ctx.convention);
    ctx.GH_TOKEN && this.packageJson.setGhToken(ctx.GH_TOKEN);

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
          title: "Initialize package.json",
          task: async () => {
            this.runtimes.init(ctx);
            await this.packageManagers.init(ctx);

            this.addScripts(ctx);
            this.addDependencies(ctx);
            this.addDevDependencies(ctx);
            this.addFeatures(ctx);
          }
        },
        {
          title: "Install plugins",
          task: createSubTasks(() => this.packageManagers.install(ctx), {...ctx, concurrent: false})
        },
        {
          title: "Load plugins",
          task: () => this.cliPlugins.loadPlugins()
        },
        {
          title: "Install plugins dependencies",
          task: createSubTasks(() => this.cliPlugins.addPluginsDependencies(ctx), {...ctx, concurrent: false})
        }
      ],
      ctx
    );
  }

  async $exec(ctx: InitCmdContext) {
    this.checkPrecondition(ctx);

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

    return [
      {
        title: "Generate project files",
        task: createSubTasks(
          [
            {
              title: "Root files",
              task: () => {
                return this.generateFiles(ctx);
              }
            },
            ...subTasks
          ],
          {...ctx, concurrent: false}
        )
      }
    ];
  }

  $afterPostInstall() {
    return [
      {
        title: "Generate barrels files",
        task: () => {
          return this.packageManagers.runScript("barrels", {
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
    this.packageJson.addScripts(this.runtimes.scripts(ctx));
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
      "@tsed/openspec": ctx.tsedVersion,
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
      "dotenv-flow": "latest",
      ...this.runtimes.get().dependencies(),
      ...this.platforms.get(ctx.platform).dependencies(ctx)
    });
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        "@types/node": "latest",
        "@types/multer": "latest",
        tslib: "latest",
        typescript: "latest",
        ...this.runtimes.get().devDependencies(),
        ...this.platforms.get(ctx.platform).devDependencies(ctx)
      },
      ctx
    );
  }

  addFeatures(ctx: InitCmdContext) {
    ctx.features.forEach((value) => {
      const feature = FeaturesMap[value.toLowerCase()];

      if (feature) {
        if (feature.dependencies) {
          this.packageJson.addDependencies(feature.dependencies, ctx);
        }

        if (feature.devDependencies) {
          this.packageJson.addDevDependencies(feature.devDependencies, ctx);
        }
      }
    });

    if (ctx.features.find((value) => value === FeatureType.GRAPHQL)) {
      this.packageJson.addDependencies(
        {
          [`apollo-server-${ctx.platform}`]: "2.25.2"
        },
        ctx
      );
    }
  }

  private generateFiles(ctx: InitCmdContext) {
    const indexCtrlBaseName = basename(
      `${this.outputFilePathPipe.transform({
        name: "Index",
        type: "controller",
        format: ctx.convention
      })}.ts`
    );

    const runtime = this.runtimes.get();
    const packageManager = this.packageManagers.get();

    ctx = {
      ...ctx,
      node: runtime instanceof NodeRuntime,
      bun: runtime instanceof BunRuntime
    };

    return this.rootRenderer.renderAll(
      [
        ...runtime.files(),
        "/init/.dockerignore.hbs",
        "/init/.gitignore.hbs",
        "/init/.barrelsby.json.hbs",
        "/init/processes.config.js.hbs",
        "/init/docker-compose.yml.hbs",
        {
          path: `/init/docker/${packageManager.name}/Dockerfile.hbs`,
          output: `Dockerfile`,
          replaces: [`docker/${packageManager.name}`]
        },
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
          replaces: [ctx.architecture === ArchitectureConvention.FEATURE ? "controllers" : null]
        }
      ].filter(Boolean),
      ctx,
      {
        baseDir: "/init"
      }
    );
  }
}
