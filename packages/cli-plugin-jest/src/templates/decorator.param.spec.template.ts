import type {GenerateCmdContext} from "@tsed/cli";
import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "decorator.param.spec",
  label: "Parameter Decorator Test",
  fileName: "{{symbolName}}.spec",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    return `import { Store } from "@tsed/core";
import { ${symbolName} } from "./${data.symbolPathBasename}.js";

describe("${symbolName}", () => {
  it("should store options", () => {
    class Test {
      method(@${symbolName}({options: "options"}) param: string){}
    }

    const store = Store.from(Test, "method", 0)

    expect(store.get(${symbolName})).toEqual({options: "options"});
  });
});
`;
  }
});
