import {defineTemplate} from "../utils/defineTemplate.js";
import type {GenerateCmdContext} from "../interfaces/index.js";

export default defineTemplate({
  id: "controller",
  label: "Controller",
  description: "Create a new controller class with a sample GET endpoint in src/controllers.",
  fileName: "{{symbolName}}.controller",
  outputDir: "{{srcDir}}/controllers",

  prompts(context: GenerateCmdContext) {
    return [
      {
        type: "list",
        name: "directory",
        message: "Which directory?",
        when(state) {
          return !!(["controller"].includes(state.type || context.type) || context.directory);
        },
        choices: context.getDirectories("controllers")
      },
      {
        type: "input",
        name: "route",
        message: "Which route?",
        when(state) {
          return !!(["controller"].includes(state.type || context.type) || context.route);
        },
        default: (state: GenerateCmdContext) => {
          return context.getRoute(state);
        }
      }
    ];
  },

  render(symbolName: string, context: GenerateCmdContext) {
    const route = context.getRoute(context.route);

    return `import {Controller} from "@tsed/di";
import {Get} from "@tsed/schema";

@Controller("${route}")
export class ${symbolName} {
  @Get("/")
  get() {
    return "hello";
  }
}`;
  }
});
