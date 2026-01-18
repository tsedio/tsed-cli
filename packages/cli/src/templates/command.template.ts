import {defineTemplate} from "../utils/defineTemplate.js";
import {kebabCase} from "change-case";

export default defineTemplate({
  id: "command",
  label: "Command",
  description: "Create a CLI command provider with prompts, context mapping and tasks in src/bin/commands.",
  fileName: "{{symbolName}}.command",
  outputDir: "{{srcDir}}/bin/commands",
  render(symbolName: string) {
    const symbolParamName = kebabCase(symbolName);

    return `import {Command, CommandProvider} from "@tsed/cli-core";
import type {PromptOptions} from "@tsed/cli-prompts";

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
   *  Ask questions with the Ts.ED prompt runner (powered by @clack/prompts).
   *  Return an empty array or don't implement the method to skip this step.
   */
  async $prompt(initialOptions: Partial<${symbolName}Context>): Promise<PromptOptions[]> {
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
   *  This step runs your tasks via @tsed/cli-tasks helpers.
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
