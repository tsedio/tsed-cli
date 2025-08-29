import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "value",
  label: "Value",
  fileName: "{{symbolName}}.value",
  outputDir: "{{srcDir}}/services",

  render(symbolName: string) {
    return `import {injectable} from "@tsed/di";

export const ${symbolName} = injectable(Symbol.for("${symbolName}")).value({}).token();
`;
  }
});
