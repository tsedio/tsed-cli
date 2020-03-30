import {
  CliPlugins,
  CliService,
  Command,
  Configuration,
  createTasksRunner,
  ICliDefaultOptions,
  ICommand,
  Inject,
  ProjectPackageJson,
  QuestionOptions,
  RootRendererService,
  SrcRendererService
} from "@tsed/cli-core";
import {camelCase, paramCase} from "change-case";
import * as Fs from "fs-extra";
import * as Listr from "listr";
import {basename, join} from "path";
import {Features, FeatureValue} from "../../services/Features";

export interface IInitCmdContext extends ICliDefaultOptions {
  root: string;
  srcDir: string;
  projectName: string;
  tsedVersion: string;
  features: FeatureValue[];
  featuresTypeORM?: FeatureValue;

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
      defaultValue: "latest",
      description: "Use a specific version of Ts.ED (format: 5.x.x)"
    }
  }
})
export class InitCmd implements ICommand {
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
  protected srcRenderer: SrcRendererService;

  @Inject()
  protected rootRenderer: RootRendererService;

  $prompt(initialOptions: Partial<IInitCmdContext>): QuestionOptions {
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

  $mapContext(ctx: Partial<IInitCmdContext>): IInitCmdContext {
    ctx.projectName = paramCase(ctx.projectName || basename(this.packageJson.dir));

    if (ctx.root !== ".") {
      this.packageJson.dir = join(this.packageJson.dir, ctx.projectName);
    }

    const features: FeatureValue[] = [];

    Object.entries(ctx)
      .filter(([key]) => key.startsWith("features"))
      .forEach(([key, value]: any[]) => {
        delete ctx[key];
        features.push(...[].concat(value));
      });

    features.forEach(feature => {
      feature.type.split(":").forEach(type => {
        ctx[camelCase(type)] = true;
      });
    });

    return {
      ...ctx,
      features,
      srcDir: this.configuration.project?.srcDir
    } as IInitCmdContext;
  }

  async $beforeExec(ctx: IInitCmdContext) {
    Fs.ensureDirSync(this.packageJson.dir);

    this.packageJson.name = ctx.projectName;
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);
    this.addScripts(ctx);
    this.addFeatures(ctx);

    await createTasksRunner(
      [
        {
          title: "Install plugins",
          task: () => this.packageJson.install({packageManager: "yarn"})
        },
        {
          title: "Load plugins",
          task: () => this.cliPlugins.loadPlugins()
        }
      ],
      ctx
    );
  }

  async $exec(ctx: IInitCmdContext) {
    const subTasks = [
      ...(await this.cliService.getTasks("generate", {
        type: "server",
        name: "Server",
        route: "/rest"
      })),
      ...(await this.cliService.getTasks("generate", {
        type: "controller",
        route: "hello-world",
        name: "HelloWorld"
      }))
    ];

    return [
      {
        title: "Generate project files",
        task: (ctx: any) => {
          return new Listr(
            [
              {
                title: "Root files",
                task: () =>
                  this.rootRenderer.renderAll(
                    [
                      "init/.dockerignore.hbs",
                      "init/.gitignore.hbs",
                      "init/docker-compose.yml.hbs",
                      "init/Dockerfile.hbs",
                      "init/README.md.hbs",
                      "init/tsconfig.compile.json.hbs",
                      "init/tsconfig.json.hbs"
                    ],
                    ctx
                  )
              },
              {
                title: "Create index",
                task: async () => {
                  return this.srcRenderer.renderAll(["init/index.ts.hbs"], ctx);
                }
              },
              ...subTasks
            ],
            {concurrent: false}
          );
        }
      }
    ];
  }

  addScripts(ctx: IInitCmdContext) {
    this.packageJson.addScripts({
      build: "yarn tsc",
      tsc: "tsc --project tsconfig.compile.json",
      "tsc:w": "tsc --project tsconfig.json -w",
      start: "nodemon --watch \"src/**/*.ts\" --ignore \"node_modules/**/*\" --exec ts-node src/index.ts",
      "start:prod": "cross-env NODE_ENV=production node dist/index.js"
    });
  }

  addDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDependencies(
      {
        "@tsed/common": ctx.tsedVersion,
        "@tsed/core": ctx.tsedVersion,
        "@tsed/di": ctx.tsedVersion,
        "@tsed/ajv": ctx.tsedVersion,
        "ajv": "latest",
        "body-parser": "latest",
        cors: "latest",
        compression: "latest",
        concurrently: "latest",
        "cookie-parser": "latest",
        express: "latest",
        "method-override": "latest",
        "cross-env": "latest"
      },
      ctx
    );
  }

  addDevDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        "@types/cors": "2.8.6",
        "@types/express": "latest",
        "@types/node": "latest",
        "@types/compression": "latest",
        "@types/cookie-parser": "latest",
        "@types/method-override": "latest",
        concurrently: "latest",
        nodemon: "latest",
        "ts-node": "latest",
        typescript: "latest"
      },
      ctx
    );
  }

  addFeatures(ctx: IInitCmdContext) {
    ctx.features.forEach(feature => {
      if (feature.dependencies) {
        this.packageJson.addDependencies(feature.dependencies, ctx);
      }

      if (feature.devDependencies) {
        this.packageJson.addDevDependencies(feature.devDependencies, ctx);
      }
    });
  }
}
