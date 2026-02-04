import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "exception-filter",
  label: "Exception Filter",
  description: "Create an exception filter class annotated with @Catch to handle thrown errors in src/filters.",
  fileName: "{{symbolName}}.exception-filter",
  outputDir: "{{srcDir}}/filters",

  render(symbolName: string) {
    return `import {BaseContext} from "@tsed/di";
import {Catch, ExceptionFilterMethods} from "@tsed/platform-exceptions";

@Catch(Error)
export class ${symbolName} implements ExceptionFilterMethods {
   catch(exception: Exception, ctx: BaseContext) {

   }
}
`;
  }
});
