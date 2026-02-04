import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "module",
  label: "Module",
  description: "Create a Ts.ED module class in src.",
  fileName: "{{symbolName}}.module",
  outputDir: "{{srcDir}}",

  render(symbolName: string) {
    return `import {Module} from "@tsed/di";

@Module()
export class ${symbolName} {

}
`;
  }
});
