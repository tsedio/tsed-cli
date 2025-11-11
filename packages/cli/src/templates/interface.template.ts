import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "interface",
  label: "Interface",
  description: "Create a TypeScript interface file in src/interfaces.",
  fileName: "{{symbolName}}.interface",
  outputDir: "{{srcDir}}/interfaces",

  render(symbolName: string) {
    return `export interface ${symbolName} {

}
`;
  }
});
