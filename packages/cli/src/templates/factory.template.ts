import {defineTemplate} from "../utils/defineTemplate.js";
import {camelCase, pascalCase} from "change-case";

export default defineTemplate({
  id: "factory",
  label: "Factory",
  description: "Generate a synchronous factory token for Ts.ED DI in src/services.",
  fileName: "{{symbolName}}.factory?",
  outputDir: "{{srcDir}}/services",

  render(symbolName: string) {
    const camelName = camelCase(symbolName);
    const optName = pascalCase(symbolName + "Options");

    return `import {injectable, constant} from "@tsed/di";

interface ${optName} {
  
}
    
declare global {
  namespace TsED {
    interface Configuration extends Record<string, any> {
      ${camelName}: ${optName};
    }
  }
}    

export const ${symbolName} = injectable(Symbol.for("${symbolName}"))
  .factory(() => {
    const myConstant = constant<${optName}>("${camelName}");
    
    // do something
    
    return {};
  })
  .token();
  
export type ${symbolName} = typeof ${symbolName};`;
  }
});
