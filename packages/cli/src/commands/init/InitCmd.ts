import {basename, join} from "node:path";

import {
  CliExeca,
  CliFs,
  CliLoadFile,
  cliPackageJson,
  CliPlugins,
  command,
  type CommandProvider,
  Configuration,
  createSubTasks,
  createTasksRunner,
  inject,
  PackageManager,
  PackageManagersModule,
  ProjectPackageJson,
  type QuestionOptions,
  type Task
} from "@tsed/cli-core";
import {isString} from "@tsed/core";
import {constant} from "@tsed/di";
import {$asyncAlter} from "@tsed/hooks";
import {kebabCase} from "change-case";

import {DEFAULT_TSED_TAGS, TEMPLATE_DIR} from "../../constants/index.js";
import {exec} from "../../fn/exec.js";
import {render} from "../../fn/render.js";
import {ArchitectureConvention} from "../../interfaces/ArchitectureConvention.js";
import {type InitCmdContext, PlatformType} from "../../interfaces/index.js";
import type {InitOptions} from "../../interfaces/InitCmdOptions.js";
import {ProjectConvention} from "../../interfaces/ProjectConvention.js";
import {PlatformsModule} from "../../platforms/PlatformsModule.js";
import {RuntimesModule} from "../../runtimes/RuntimesModule.js";
import {BunRuntime} from "../../runtimes/supports/BunRuntime.js";
import {NodeRuntime} from "../../runtimes/supports/NodeRuntime.js";
import {CliProjectService} from "../../services/CliProjectService.js";
import {FeaturesMap, FeatureType} from "./config/FeaturesPrompt.js";
import {InitFileSchema} from "./config/InitFileSchema.js";
import {mapToContext} from "./mappers/mapToContext.js";
import {getFeaturesPrompt} from "./prompts/getFeaturesPrompt.js";

export class InitCmd implements CommandProvider {
  protected configuration = inject(Configuration);
  protected cliPlugins = inject(CliPlugins);
  protected packageJson = inject(ProjectPackageJson);
  protected packageManagers = inject(PackageManagersModule);
  protected runtimes = inject(RuntimesModule);
  protected platforms = inject(PlatformsModule);
  protected cliPackageJson = cliPackageJson();
  protected cliLoadFile = inject(CliLoadFile);
  protected project = inject(CliProjectService);
  protected execa = inject(CliExeca);
  protected fs = inject(CliFs);

  checkPrecondition(ctx: InitOptions) {
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
        default: kebabCase(initialOptions.root!),
        when: initialOptions.root !== ".",
        transformer(input: string) {
          return kebabCase(input);
        }
      },
      ...getFeaturesPrompt(
        runtimes,
        packageManagers.filter((o: string) => o !== "bun"),
        initialOptions
      )
    ];
  }

  $mapContext(ctx: any): InitOptions {
    this.resolveRootDir(ctx);
    ctx = mapToContext(ctx);

    this.runtimes.init(ctx);

    this.runtimes.list().forEach((key: string) => {
      ctx[key] = ctx.runtime === key;
    });

    this.packageManagers.list().forEach((key: string) => {
      ctx[key] = ctx.packageManager === key;
    });

    return {
      ...ctx,
      cliVersion: ctx.cliVersion || this.cliPackageJson.version,
      srcDir: constant("project.srcDir", "src")
    } as InitOptions;
  }

  async $beforeExec(ctx: InitOptions): Promise<any> {
    this.fs.ensureDirSync(this.packageJson.dir);

    ctx.projectName && (this.packageJson.name = ctx.projectName);
    ctx.packageManager && this.packageJson.setPreference("packageManager", ctx.packageManager);
    ctx.runtime && this.packageJson.setPreference("runtime", ctx.runtime);
    ctx.architecture && this.packageJson.setPreference("architecture", ctx.architecture);
    ctx.convention && this.packageJson.setPreference("convention", ctx.convention);
    ctx.platform && this.packageJson.setPreference("platform", ctx.convention);
    ctx.GH_TOKEN && this.packageJson.setGhToken(ctx.GH_TOKEN);

    await createTasksRunner(
      [
        {
          title: "Write RC files",
          skip: () => !ctx.GH_TOKEN,
          task: () => {
            return Promise.all([render(".npmrc", ctx), render(".yarnrc", ctx)]);
          }
        },
        {
          title: "Initialize package.json",
          task: async () => {
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

  async $exec(ctx: InitOptions): Promise<Task[]> {
    this.checkPrecondition(ctx);
    const runtime = this.runtimes.get();

    ctx = {
      ...ctx,
      node: runtime instanceof NodeRuntime,
      bun: runtime instanceof BunRuntime,
      compiled: runtime instanceof NodeRuntime && runtime.isCompiled()
    };

    return [
      {
        title: "Render base files",
        task: async () => {
          return this.renderFiles(ctx);
        }
      },
      {
        title: "Alter package json",
        task: async () => {
          return $asyncAlter("$alterPackageJson", this.packageJson, [ctx]);
        }
      },
      {
        title: "Generate additional project files",
        task: createSubTasks(
          async () => {
            const subTasks = [
              ...(await exec("generate", {
                ...ctx,
                type: "controller",
                route: "rest",
                name: "HelloWorld",
                directory: "rest"
              })),
              ...(ctx.commands
                ? await exec("generate", {
                    ...ctx,
                    type: "command",
                    route: "hello",
                    name: "hello"
                  })
                : [])
            ];

            return $asyncAlter("$alterInitSubTasks", subTasks, [ctx]);
          },
          {...ctx, concurrent: false}
        )
      },
      {
        title: "transform generated files to the project configuration",
        task: async () => {
          return this.project.transformFiles(ctx);
        }
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

  resolveRootDir(ctx: Partial<InitOptions>) {
    const rootDirName = kebabCase(ctx.projectName || basename(this.packageJson.dir));

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

  addScripts(ctx: InitOptions): void {
    this.packageJson.addScripts(this.runtimes.scripts(ctx));

    if (ctx.eslint || ctx.testing) {
      const runtime = this.runtimes.get();

      const scripts = {
        test: [ctx.eslint && runtime.run("test:lint"), ctx.testing && runtime.run("test:coverage")].filter(Boolean).join("&&")
      };

      this.packageJson.addScripts(scripts);
    }
  }

  addDependencies(ctx: InitOptions) {
    this.packageJson.addDependencies({
      "@tsed/core": ctx.tsedVersion,
      "@tsed/di": ctx.tsedVersion,
      "@tsed/ajv": ctx.tsedVersion,
      "@tsed/exceptions": ctx.tsedVersion,
      "@tsed/schema": ctx.tsedVersion,
      "@tsed/json-mapper": ctx.tsedVersion,
      "@tsed/openspec": ctx.tsedVersion,
      "@tsed/platform-http": ctx.tsedVersion,
      "@tsed/platform-cache": ctx.tsedVersion,
      "@tsed/platform-exceptions": ctx.tsedVersion,
      "@tsed/platform-log-request": ctx.tsedVersion,
      "@tsed/platform-middlewares": ctx.tsedVersion,
      "@tsed/platform-params": ctx.tsedVersion,
      "@tsed/platform-response-filter": ctx.tsedVersion,
      "@tsed/platform-views": ctx.tsedVersion,
      "@tsed/platform-multer": ctx.tsedVersion,
      "@tsed/logger": "latest",
      "@tsed/engines": "latest",
      "@tsed/barrels": "latest",
      ajv: "latest",
      "cross-env": "latest",
      dotenv: "latest",
      "dotenv-expand": "latest",
      "dotenv-flow": "latest",
      ...this.runtimes.get().dependencies(),
      ...this.platforms.get(ctx.platform).dependencies(ctx)
    });
  }

  addDevDependencies(ctx: InitOptions) {
    this.packageJson.addDevDependencies(
      {
        "@types/node": "latest",
        "@types/multer": "latest",
        tslib: "latest",
        ...this.runtimes.get().devDependencies(),
        ...this.platforms.get(ctx.platform).devDependencies(ctx)
      },
      ctx
    );
  }

  addFeatures(ctx: InitOptions) {
    ctx.features?.forEach((value) => {
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

    if (ctx.features?.find((value) => value === FeatureType.GRAPHQL)) {
      this.packageJson.addDependencies(
        {
          [`apollo-server-${ctx.platform}`]: "2.25.2"
        },
        ctx
      );
    }
  }

  async baseFiles(ctx: InitCmdContext) {
    const packageManager = inject(PackageManagersModule).get();
    const pm2 = ctx.bun ? "bun" : ctx.compiled ? "node-compiled" : "node-loader";
    const runtimes = inject(RuntimesModule);
    const runtime = runtimes.get();

    // files with higher priority
    const promises = [
      "tsconfig.base.json",
      "tsconfig.config.json",
      "tsconfig.spec.json",
      "tsconfig.node.json",
      "docker-compose.yml",
      `dockerfile.${packageManager.name}`,
      ".dockerignore",
      ".gitignore",
      "server",
      "config",
      "index",
      "index.config.util",
      "index.logger",
      "index.controller",
      "barrels",
      "readme",
      `pm2.${pm2}`,
      ctx.swagger && "/views/swagger.ejs",
      ...runtime.files()
    ].map((id) => {
      return id && render(id, ctx);
    });

    await Promise.all(promises);
  }

  async renderFiles(ctx: InitOptions) {
    // base files
    await this.baseFiles(ctx);

    const files = await $asyncAlter("$alterRenderFiles", [] as any[], [ctx]);

    const promises = files.map((option) => {
      if (!option) {
        return;
      }

      if (isString(option)) {
        const [id, name] = option.split(":");

        return render(id, {
          ...ctx,
          from: TEMPLATE_DIR,
          name: name || id
        });
      } else {
        if ("id" in option) {
          return render(option.id, {
            ...ctx,
            ...option
          });
        }
      }
    });

    await Promise.all(promises);
  }
}

command(InitCmd, {
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
      description: "Set the default platform for Ts.ED (express, koa or fastify)"
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
});
