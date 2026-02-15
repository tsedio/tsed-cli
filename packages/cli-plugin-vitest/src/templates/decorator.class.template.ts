import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";

export default defineTemplate({
  id: "decorator.class.spec",
  label: "Class Decorator Test",
  fileName: "{{symbolName}}.spec",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    return `import { expect, describe, it } from "vitest";
import { ${symbolName} } from "./${data.symbolPathBasename}.js";

describe("${symbolName}", () => {
  it("should do something", () => {
    @${symbolName}({})
    class Test {
    }

    expect(typeof ${symbolName}).toBe("function")
  });
});
`;
  }
});
