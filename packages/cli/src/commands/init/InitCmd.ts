import {Command, ICommand, ProjectPackageJson, QuestionOptions} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {paramCase} from "change-case";
import * as Fs from "fs-extra";
import {basename, join} from "path";
import {Features, FeatureValue} from "../../services/Features";

export interface IInitCmdOptions {
  root: string;
  name: string;
  tsedVersion?: string;
  features?: FeatureValue[];
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
  @Inject(ProjectPackageJson)
  packageJson: ProjectPackageJson;

  @Features()
  features: Features;

  $prompt(initialOptions: IInitCmdOptions): QuestionOptions {
    return [
      {
        type: "input",
        name: "name",
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
    options.name = paramCase(options.name || basename(this.packageJson.dir));

    if (options.root !== ".") {
      this.packageJson.dir = join(this.packageJson.dir, options.name);
    }

    Fs.ensureDirSync(this.packageJson.dir);

    this.packageJson.name = options.name;
    this.addDependencies(options);
    this.addDevDependencies(options);
    this.addScripts(options);
    this.addFeatures(options);

    return [];
  }

  addScripts(options: IInitCmdOptions) {
    this.packageJson.addScripts({
      build: "yarn tsc",
      tsc: "tsc --project tsconfig.compile.json",
      "tsc:w": "tsc --project tsconfig.json -w",
      start: 'nodemon --watch "src/**/*.ts" --ignore "node_modules/**/*" --exec ts-node src/index.ts',
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
