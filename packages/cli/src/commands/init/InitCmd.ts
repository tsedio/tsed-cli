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
  inject,
  PackageManagersModule,
  ProjectPackageJson,
  type Task
} from "@tsed/cli-core";
import type {PromptQuestion} from "@tsed/cli-prompts";
import {tasks} from "@tsed/cli-tasks";
import {isString} from "@tsed/core";
import {constant} from "@tsed/di";
import {$asyncAlter} from "@tsed/hooks";
import {kebabCase} from "change-case";

import {TEMPLATE_DIR} from "../../constants/index.js";
import {exec} from "../../fn/exec.js";
import {render} from "../../fn/render.js";
import {taskOutput} from "../../fn/taskOutput.js";
import type {InitCmdContext} from "../../interfaces/index.js";
import type {InitOptions} from "../../interfaces/InitCmdOptions.js";
import {PlatformsModule} from "../../platforms/PlatformsModule.js";
import {RuntimesModule} from "../../runtimes/RuntimesModule.js";
import {BunRuntime} from "../../runtimes/supports/BunRuntime.js";
import {NodeRuntime} from "../../runtimes/supports/NodeRuntime.js";
import {CliProjectService} from "../../services/CliProjectService.js";
import {FeaturesMap, FeatureType} from "./config/FeaturesPrompt.js";
import {InitSchema} from "./config/InitSchema.js";
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

  async $prompt(initialOptions: Partial<InitOptions>): Promise<PromptQuestion[]> {
    if (initialOptions.file) {
      const file = join(this.packageJson.cwd, initialOptions.file);

      initialOptions = {
        ...initialOptions,
        ...(await this.cliLoadFile.loadFile(file, InitSchema()))
      };
    }

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

  preExec(ctx: InitOptions) {
    this.fs.ensureDirSync(this.packageJson.cwd);

    ctx.projectName && (this.packageJson.name = ctx.projectName);
    ctx.packageManager && this.packageJson.setPreference("packageManager", ctx.packageManager);
    ctx.runtime && this.packageJson.setPreference("runtime", ctx.runtime);
    ctx.architecture && this.packageJson.setPreference("architecture", ctx.architecture);
    ctx.convention && this.packageJson.setPreference("convention", ctx.convention);
    ctx.platform && this.packageJson.setPreference("platform", ctx.platform);
    ctx.GH_TOKEN && this.packageJson.setGhToken(ctx.GH_TOKEN);

    return tasks(
      [
        {
          title: "Write RC files",
          skip: () => !ctx.premium,
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
        this.packageManagers.task("Install plugins", ctx),
        {
          title: "Load plugins",
          task: () => this.cliPlugins.loadPlugins()
        },
        {
          title: "Install plugins dependencies",
          task: () => this.cliPlugins.addPluginsDependencies(ctx)
        }
      ],
      ctx
    );
  }

  async $exec(ctx: InitOptions): Promise<Task[]> {
    await this.preExec(ctx);

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
        task: () => this.renderFiles(ctx)
      },
      {
        title: "Alter package json",
        task: async () => {
          await $asyncAlter("$alterPackageJson", this.packageJson, [ctx]);
        }
      },
      {
        title: "Generate additional project files",
        task: async () => {
          const subTasks = [
            ...(await exec("generate", {
              //...ctx,
              type: "controller",
              route: "rest",
              name: "HelloWorld",
              directory: "rest"
            })),
            ...(ctx.commands
              ? await exec("generate", {
                  //...ctx,
                  type: "command",
                  route: "hello",
                  name: "hello"
                })
              : [])
          ];

          return $asyncAlter("$alterInitSubTasks", subTasks, [ctx]);
        }
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
    const rootDirName = kebabCase(ctx.projectName || basename(this.packageJson.cwd));

    if (this.packageJson.cwd.endsWith(rootDirName)) {
      ctx.projectName = ctx.projectName || rootDirName;
      ctx.root = ".";
      return;
    }

    ctx.projectName = ctx.projectName || rootDirName;

    if (ctx.root && ctx.root !== ".") {
      this.packageJson.setCWD(join(this.packageJson.cwd, rootDirName));
      ctx.root = ".";
    }
  }

  addScripts(ctx: InitOptions): void {
    this.packageJson.addScripts(this.runtimes.scripts(ctx));

    if (ctx.eslint || ctx.testing) {
      const runtime = this.runtimes.get();

      const scripts = {
        test: [ctx.eslint && runtime.run("test:lint"), ctx.testing && runtime.run("test:coverage")].filter(Boolean).join(" && ")
      };

      this.packageJson.addScripts(scripts);
    }
  }

  addDependencies(ctx: InitOptions) {
    this.packageJson.addDependencies({
      "@tsed/core": ctx.tsedVersion,
      "@tsed/di": ctx.tsedVersion,
      "@tsed/ajv": ctx.tsedVersion,
      "@tsed/config": ctx.tsedVersion,
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
      "@tsed/logger-std": "latest",
      "@tsed/engines": "latest",
      "@tsed/barrels": "latest",
      ajv: "latest",
      "cross-env": "latest",
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
      "tsconfig.json",
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
      ctx.commands && "index.command",
      "barrels",
      "readme",
      "agents",
      `pm2.${pm2}`,
      "/views/home.ejs",
      ...runtime.files()
    ].map((id) => {
      return id && render(id, ctx);
    });

    await Promise.all(promises);
  }

  async renderFiles(ctx: InitOptions) {
    // base files
    let startTime = Date.now();

    await this.baseFiles(ctx);

    taskOutput(`Base files rendered (${Date.now() - startTime}ms)`);

    const files = await $asyncAlter("$alterRenderFiles", [] as any[], [ctx]);

    startTime = Date.now();

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
    taskOutput(`Plugins files rendered (${Date.now() - startTime}ms)`);
  }
}

command({
  token: InitCmd,
  name: "init",
  description: "Init a new Ts.ED project",
  inputSchema: InitSchema,
  disableReadUpPkg: true
});
