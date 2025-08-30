import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";

export default defineTemplate({
  id: "decorator.property.spec",
  label: "Property Decorator Test",
  fileName: "{{symbolName}}.spec",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    return `import { expect, describe, it } from "vitest";
import { ${symbolName} } from "./${data.symbolPathBasename}.js";

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
