import {defineTemplate} from "@tsed/cli";
import type {GenerateCmdContext} from "@tsed/cli";

export default defineTemplate({
  id: "decorator.property.spec",
  label: "Property Decorator Test",
  fileName: "{{symbolName}}.spec",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    return `import { ${symbolName} } from "./${data.symbolPathBasename}.js";

describe("${symbolName}", () => {
  it("should do something", () => {
    class Test {
      @${symbolName}({})
      property: string;
    }

    expect(typeof ${symbolName}).toBe("function")
    expect(typeof ${symbolName}()).toBe("function")
  });
});
`;
  }
});
