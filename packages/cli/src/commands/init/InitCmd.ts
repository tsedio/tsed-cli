import {
  CliPlugins,
  CliService,
  Command,
  Configuration,
  ICommand,
  Inject,
  ProjectPackageJson,
  QuestionOptions,
  RenderService
} from "@tsed/cli-core";
import {paramCase} from "change-case";
import * as Fs from "fs-extra";
import * as Listr from "listr";
import {basename, join} from "path";
import {Features, FeatureValue} from "../../services/Features";

export interface IInitCmdOptions {
  root: string;
  projectName: string;
  tsedVersion?: string;
  features?: FeatureValue[];
  srcDir?: string;
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
  @Inject()
  protected cliPlugins: CliPlugins;

  @Inject()
  protected packageJson: ProjectPackageJson;

  @Features()
  protected features: Features;

  @Inject()
  protected cliService: CliService;

  protected srcRenderer: RenderService;
  protected rootRenderer: RenderService;

  constructor(@Configuration() protected configuration: Configuration, protected renderService: RenderService) {}

  $prompt(initialOptions: IInitCmdOptions): QuestionOptions {
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

  async $exec(options: IInitCmdOptions) {
    options.projectName = paramCase(options.projectName || basename(this.packageJson.dir));

    if (options.root !== ".") {
      this.packageJson.dir = join(this.packageJson.dir, options.projectName);
    }

    this.srcRenderer = this.renderService.clone();
    this.rootRenderer = this.renderService.clone({srcDir: ""});

    Fs.ensureDirSync(this.packageJson.dir);

    this.packageJson.name = options.projectName;
    this.addDependencies(options);
    this.addDevDependencies(options);
    this.addScripts(options);
    this.addFeatures(options);

    options.srcDir = this.configuration.get("project:srcDir");

    return [
      {
        title: "Install plugins",
        task: (ctx: any) => {
          ctx.subTasks = [];

          return this.packageJson.install({packageManager: "yarn"});
        }
      },
      {
        title: "Load plugins",
        task: async (ctx: any) => {
          await this.cliPlugins.loadPlugins();

          ctx.subTasks.push(
            ...(await this.cliService.getTasks("generate", {
              type: "server",
              name: "Server",
              root: "/rest"
            })),
            ...(await this.cliService.getTasks("generate", {
              type: "controller",
              route: "hello-world",
              name: "HelloWorld"
            }))
          );
        }
      },
      {
        title: "Generate files",
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
                    options
                  )
              },
              {
                title: "Create index",
                task: async () => {
                  return this.srcRenderer.renderAll(["init/index.ts.hbs"], options);
                }
              },
              ...ctx.subTasks
            ],
            {concurrent: false}
          );
        }
      }
    ];
  }

  addScripts(options: IInitCmdOptions) {
    this.packageJson.addScripts({
      build: "yarn tsc",
      tsc: "tsc --project tsconfig.compile.json",
      "tsc:w": "tsc --project tsconfig.json -w",
      start: "nodemon --watch \"src/**/*.ts\" --ignore \"node_modules/**/*\" --exec ts-node src/index.ts",
      "start:prod": "cross-env NODE_ENV=production node dist/index.js"
    });
  }

  addDependencies(options: IInitCmdOptions) {
    this.packageJson.addDependencies(
      {
        "@tsed/common": options.tsedVersion,
        "@tsed/core": options.tsedVersion,
        "@tsed/di": options.tsedVersion,
        "@tsed/ajv": options.tsedVersion,
        "body-parser": "latest",
        cors: "latest",
        compression: "latest",
        concurrently: "latest",
        "cookie-parser": "latest",
        express: "latest",
        "method-override": "latest",
        "cross-env": "latest"
      },
      options
    );
  }

  addDevDependencies(options: IInitCmdOptions) {
    this.packageJson.addDevDependencies(
      {
        "@types/cors": "2.8.6",
        "@types/express": "latest",
        "@types/node": "latest",
        concurrently: "latest",
        nodemon: "latest",
        "ts-node": "latest",
        tslint: "latest",
        typescript: "latest"
      },
      options
    );
  }

  addFeatures(options: IInitCmdOptions) {
    Object.entries(options)
      .filter(([key]) => key.startsWith("features"))
      .forEach(([_, value]: [string, FeatureValue | FeatureValue[]]) => {
        [].concat(value as any).forEach((item: FeatureValue) => {
          if (item.dependencies) {
            this.packageJson.addDependencies(item.dependencies, options);
          }

          if (item.devDependencies) {
            this.packageJson.addDevDependencies(item.devDependencies, options);
          }
        });
      });
  }
}
