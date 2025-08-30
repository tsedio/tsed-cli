import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "interface",
  label: "Interface",
  fileName: "{{symbolName}}.interface",
  outputDir: "{{srcDir}}/interfaces",

  render(symbolName: string) {
    return `export interface ${symbolName} {

}
`;
  }
});
