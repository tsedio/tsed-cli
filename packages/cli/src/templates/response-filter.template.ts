import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "response-filter",
  label: "Response Filter",
  fileName: "{{symbolName}}.response-filter",
  outputDir: "{{srcDir}}/filters",

  render(symbolName: string) {
    return `import {ResponseFilter, ResponseFilterMethods} from "@tsed/platform-response-filter";
import {BaseContext} from "@tsed/di";

@ResponseFilter("text/xml")
export class ${symbolName} implements ResponseFilterMethods {
  transform(data: any, ctx: BaseContext) {
    return jsToXML(data);
  }
}
`;
  }
});
