import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "pipe",
  label: "Pipe",
  fileName: "{{symbolName}}.pipe",
  outputDir: "{{srcDir}}/pipes",

  render(symbolName: string) {
    return `import {Injectable} from "@tsed/di";
import {PipeMethods, ParamMetadata} from "@tsed/platform-params";

@Injectable()
export class ${symbolName} extends PipeMethods {
  transform(value: any, param: ParamMetadata) {
    return null;
  }
}
`;
  }
});
