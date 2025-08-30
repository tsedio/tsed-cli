import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";

export default defineTemplate({
  id: "decorator.endpoint.spec",
  label: "Endpoint Decorator Test",
  fileName: "{{symbolName}}.spec",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    return `import { expect, describe, it } from "vitest";
import { Store } from "@tsed/core";
import { ${symbolName} } from "./${data.symbolPathBasename}.js";

describe("${symbolName}", () => {
  it("should store options", () => {
    class Test {
      @${symbolName}({options: "options"})
      method(param: string) {}
    }

    const store = Store.fromMethod(Test, "method");

    expect(store.get(${symbolName})).toEqual({options: "options"});
  });
});
`;
  }
});
