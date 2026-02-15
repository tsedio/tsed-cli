import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "model",
  label: "Model",
  description: "Create a model class with a sample @Property in src/models.",
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
