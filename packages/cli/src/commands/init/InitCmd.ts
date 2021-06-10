import {
  CliDefaultOptions,
  CliFs,
  CliPlugins,
  CliService,
  Command,
  CommandProvider,
  Configuration,
  createTasks,
  createTasksRunner,
  Inject,
  InstallOptions,
  PackageManager,
  ProjectPackageJson,
  QuestionOptions,
  RootRendererService
} from "@tsed/cli-core";
import {camelCase, paramCase, pascalCase} from "change-case";
import {basename, join} from "path";
import {DEFAULT_TSED_TAGS} from "../../constants";
import {ProjectConvention} from "../../interfaces/ProjectConvention";
import {OutputFilePathPipe} from "../../pipes/OutputFilePathPipe";
import {Features, FeatureValue} from "../../services/Features";

export interface InitCmdContext extends CliDefaultOptions, InstallOptions {
  platform: "express" | "koa";
  root: string;
  srcDir: string;
  projectName: string;
  tsedVersion: string;
  features: FeatureValue[];
  featuresTypeORM?: FeatureValue;
  babel?: boolean;
  webpack?: boolean;
  convention?: ProjectConvention;
  commands?: boolean;
  GH_TOKEN?: string;

  [key: string]: any;
}

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
    "-t, --tsed-version <version>": {
      type: String,
      defaultValue: DEFAULT_TSED_TAGS,
      description: "Use a specific version of Ts.ED (format: 5.x.x)"
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

  @Features()
  protected features: Features;

  @Inject()
  protected cliService: CliService;

  @Inject()
  protected rootRenderer: RootRendererService;

  @Inject()
  protected outputFilePathPipe: OutputFilePathPipe;

  @Inject()
  protected fs: CliFs;

  $prompt(initialOptions: Partial<InitCmdContext>): QuestionOptions {
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
      ...this.features
    ];
  }

  $mapContext(ctx: Partial<InitCmdContext>): InitCmdContext {
    this.resolveRootDir(ctx);

    const features: FeatureValue[] = [];

    Object.entries(ctx)
      .filter(([key]) => key.startsWith("features"))
      .forEach(([key, value]: any[]) => {
        delete ctx[key];
        features.push(...[].concat(value));
      });

    features.forEach((feature) => {
      feature.type.split(":").forEach((type) => {
        ctx[camelCase(type)] = true;
      });
    });

    return {
      ...ctx,
      features,
      srcDir: this.configuration.project?.srcDir,
      npm: ctx.packageManager === PackageManager.NPM,
      yarn: ctx.packageManager === PackageManager.YARN,
      express: ctx.platform === "express",
      koa: ctx.platform === "koa",
      platformSymbol: pascalCase(`Platform ${ctx.platform}`)
    } as InitCmdContext;
  }

  async $beforeExec(ctx: InitCmdContext): Promise<any> {
    this.fs.ensureDirSync(this.packageJson.dir);
    this.packageJson.name = ctx.projectName;

    ctx.packageManager && this.packageJson.setPreference("packageManager", ctx.packageManager);
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
          task: () => this.packageJson.install(ctx)
        },
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

  async $exec(ctx: InitCmdContext): Promise<any> {
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
        name: "HelloWorld"
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
        task: (ctx: any) => {
          return createTasks(
            [
              {
                title: "Root files",
                task: () =>
                  this.rootRenderer.renderAll(
                    [
                      "/init/.dockerignore.hbs",
                      "/init/.gitignore.hbs",
                      ctx.babel && "/init/.babelrc.hbs",
                      ctx.webpack && "/init/webpack.config.js.hbs",
                      "/init/docker-compose.yml.hbs",
                      "/init/Dockerfile.hbs",
                      "/init/README.md.hbs",
                      "/init/tsconfig.compile.json.hbs",
                      "/init/tsconfig.json.hbs",
                      "/init/src/index.ts.hbs",
                      "/init/src/config/env/index.ts.hbs",
                      "/init/src/config/logger/index.ts.hbs",
                      "/init/src/config/index.ts.hbs",
                      ctx.commands && "/init/src/bin/index.ts.hbs",
                      ctx.swagger && "/init/views/index.ejs.hbs",
                      ctx.swagger && {
                        path: "/init/src/controllers/pages/IndexCtrl.ts.hbs",
                        basename: indexCtrlBaseName
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
          );
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
      build: `${runner} tsc`,
      tsc: "tsc --project tsconfig.compile.json",
      "tsc:w": "tsc --project tsconfig.json -w",
      start: "tsnd --inspect --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
      "start:prod": "cross-env NODE_ENV=production node dist/index.js"
    });

    if (ctx.babel) {
      this.packageJson.addScripts({
        build: `${runner} tsc && babel src --out-dir dist --extensions ".ts,.tsx" --source-maps inline`,
        start: "babel-watch --extensions .ts src/index.ts"
      });
    }

    if (ctx.webpack) {
      this.packageJson.addScripts({
        bundle: `${runner} tsc && cross-env NODE_ENV=production webpack`,
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
      ajv: "latest",
      "cross-env": "latest",
      dotenv: "latest"
    });
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        "@types/node": "latest",
        "@types/multer": "latest",
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
    ctx.features.forEach((feature) => {
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

    if (ctx.features.find(({type}) => type === "graphql")) {
      this.packageJson.addDependencies(
        {
          ["apollo-server-" + ctx.platform]: "latest"
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
        "koa-bodyparser": "latest",
        "koa-override": "latest",
        "koa-compress": "latest"
      },
      ctx
    );

    this.packageJson.addDevDependencies(
      {
        "@types/koa": "latest",
        "@types/koa-json": "latest",
        "@types/koa-bodyparser": "latest",
        "@types/koa__router": "latest",
        "@types/koa-compress": "latest",
        "@types/koa__cors": "latest"
      },
      ctx
    );
  }
}
