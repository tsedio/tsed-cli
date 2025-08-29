import {defineTemplate} from "../utils/defineTemplate.js";
import {kebabCase} from "change-case";

export default defineTemplate({
  id: "command",
  label: "Command",
  fileName: "{{symbolName}}.command",
  outputDir: "{{srcDir}}/bin/commands",
  render(symbolName: string) {
    const symbolParamName = kebabCase(symbolName);

    return `import {Command, CommandProvider, QuestionOptions} from "@tsed/cli-core";

export interface ${symbolName}Context {
}

@Command({
  name: "${symbolParamName}",
  description: "Command description",
  args: {
  },
  options: {
  },
  allowUnknownOption: false
})
export class ${symbolName} implements CommandProvider {
  /**
   *  Ask questions with Inquirer. Return an empty array or don't implement the method to skip this step
   */
  async $prompt(initialOptions: Partial<${symbolName}Context>): Promise<QuestionOptions> {
    return [];
  }

  /**
   * This method is called after the $prompt to create / map inputs to a proper context for the next step
   */
  $mapContext(ctx: Partial<${symbolName}Context>): ${symbolName}Context {
    return {
      ...ctx
      // map something, based on ctx
    };
  }
  /**
   *  This step run your tasks with Listr module
   */
  async $exec(ctx: ${symbolName}Context): Promise<any> {
    return [
      {
        title: "Do something",
        task: () => {
          console.log('HELLO')
        }
      }
    ];
  }
}`;
  }
});
