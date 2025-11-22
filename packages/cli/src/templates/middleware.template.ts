import type {GenerateCmdContext} from "../interfaces/GenerateCmdContext.js";
import {defineTemplate} from "../utils/defineTemplate.js";
import {s} from "@tsed/schema";

const choices = [
  {name: "Before the endpoint", value: "before"},
  {name: "After the endpoint", value: "after"}
];

export default defineTemplate({
  id: "middleware",
  label: "Middleware",
  description: "Create a middleware class implementing MiddlewareMethods in src/middlewares.",
  fileName: "{{symbolName}}.middleware",
  outputDir: "{{srcDir}}/middlewares",

  schema: s.object({
    middlewarePosition: s
      .string()
      .enum("before", "after")
      .customKey("x-choices", choices)
      .description("Middleware position (before, after).")
  }),

  prompts(context: GenerateCmdContext) {
    return [
      {
        type: "list",
        name: "middlewarePosition",
        message: () => `The middleware should be called:`,
        choices,
        when(state: any) {
          return !!(
            (["decorator"].includes(state.type || context.type) && ["middleware"].includes(state.templateType)) ||
            context.middlewarePosition
          );
        }
      }
    ];
  },
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
