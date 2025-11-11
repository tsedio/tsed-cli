import {defineTemplate} from "../utils/defineTemplate.js";
import {camelCase, pascalCase} from "change-case";

export default defineTemplate({
  id: "async.factory",
  label: "Async Factory",
  description: "Generate an async factory token for Ts.ED DI in src/services.",
  fileName: "{{symbolName}}.factory?",
  outputDir: "{{srcDir}}/services",

  render(symbolName: string) {
    const camelName = camelCase(symbolName);
    const optName = pascalCase(symbolName + "Options");

    return `import {injectable} from "@tsed/di";

interface ${optName} {
  
}
    
declare global {
  namespace TsED {
    interface Configuration extends Record<string, any> {
      ${camelName}: Options;
    }
  }
}    

export const ${symbolName} = injectable(Symbol.for("${symbolName}"))
  .factory(async () => {
    const myConstant = constant<${optName}>("${camelName}");
    
    // do something async
    await Promise.resolve();
    
    return {};
  })
  .token();
  
export type {{symbolName}} = typeof ${symbolName};`;
  }
});
