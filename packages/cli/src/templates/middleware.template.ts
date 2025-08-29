import type {GenerateCmdContext} from "../interfaces/GenerateCmdContext.js";
import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "middleware",
  label: "Middleware",
  fileName: "{{symbolName}}.middleware",
  outputDir: "{{srcDir}}/middlewares",

  prompts: (data: GenerateCmdContext) => [
    {
      type: "list",
      name: "middlewarePosition",
      message: () => `The middleware should be called:`,
      choices: [
        {name: "Before the endpoint", value: "before"},
        {name: "After the endpoint", value: "after"}
      ],
      when(state: any) {
        return !!(
          (["decorator"].includes(state.type || data.type) && ["middleware"].includes(state.templateType)) ||
          data.middlewarePosition
        );
      }
    }
  ],
  render(symbolName: string) {
    return `import {Middleware, MiddlewareMethods} from "@tsed/platform-middlewares";
import {Context} from "@tsed/platform-params";

@Middleware()
export class ${symbolName} implements MiddlewareMethods {
  use(@Context() ctx: Context) {

  }
}
`;
  }
});
