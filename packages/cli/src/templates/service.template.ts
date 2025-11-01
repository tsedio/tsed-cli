import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "service",
  label: "Service",
  fileName: "{{symbolName}}.service",
  outputDir: "{{srcDir}}/services",

  render(symbolName: string) {
    return `import {Injectable} from "@tsed/di";

@Injectable()
export class ${symbolName} {

}
`;
  }
});
