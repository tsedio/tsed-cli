import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "repository",
  label: "Repository",
  fileName: "{{symbolName}}.repository",
  outputDir: "{{srcDir}}/services",

  render(symbolName: string) {
    return `import {Injectable} from "@tsed/di";

@Injectable()
export class ${symbolName} {

}
`;
  }
});
