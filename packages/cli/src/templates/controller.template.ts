import {defineTemplate} from "../utils/defineTemplate.js";
import type {GenerateCmdContext} from "../interfaces/index.js";
import {RoutePipe} from "../pipes/index.js";
import {CliProjectService} from "../services/CliProjectService.js";
import {inject} from "@tsed/di";

export default defineTemplate({
  id: "controller",
  label: "Controller",
  fileName: "{{symbolName}}.controller",
  outputDir: "{{srcDir}}/controllers",

  prompts: (data: GenerateCmdContext) => [
    {
      type: "list",
      name: "directory",
      message: "Which directory?",
      when(state) {
        return !!(["controller"].includes(state.type || data.type) || data.directory);
      },
      choices: inject(CliProjectService).getDirectories("controllers")
    },
    {
      type: "input",
      name: "route",
      message: "Which route?",
      when(state) {
        return !!(["controller"].includes(state.type || data.type) || data.route);
      },
      default: (state: any) => {
        return inject(RoutePipe).transform(data.getName(state));
      }
    }
  ],

  render(symbolName: string, data: GenerateCmdContext) {
    const route = inject(RoutePipe).transform(data.route);

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
