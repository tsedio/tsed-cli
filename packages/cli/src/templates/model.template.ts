import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "model",
  label: "Model",
  fileName: "{{symbolName}}.model",
  outputDir: "{{srcDir}}/models",

  render(symbolName: string) {
    return `import {Property} from "@tsed/schema";

export class ${symbolName} {
  @Property()
  id: string;
}
`;
  }
});
