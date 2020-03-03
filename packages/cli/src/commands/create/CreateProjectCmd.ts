import {Command, ICommand, QuestionOptions} from "@tsed/cli-core";

export interface ICreateProjectCmdOptions {
  root: string;
  version?: string;
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
    "-v, --version <version>": {
      type: String,
      description: "Use a specific version of Ts.ED (format: 5.x.x)"
    }
  }
})
export class CreateProjectCmd implements ICommand {
  $prompt(initialOptions: Partial<ICreateProjectCmdOptions>): QuestionOptions {
    return [
      {
        type: "confirm",
        name: "generateOnCwd",
        message: "Generate project in current directory?",
        when: initialOptions.root === "."
      },
      {
        type: "input",
        name: "root",
        message: "What is your project name",
        when: initialOptions.root !== "."
      }
    ];
  }

  async $exec(options: ICreateProjectCmdOptions) {
    return [];
  }
}
