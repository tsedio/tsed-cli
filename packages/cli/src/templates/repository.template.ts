import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "repository",
  label: "Repository",
  description: "Create a repository class (service-like) for data access in src/services.",
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
