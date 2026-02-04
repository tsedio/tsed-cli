import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";

export default defineTemplate({
  id: "decorator.prop.spec",
  label: "Property Decorator with @Property Test",
  fileName: "{{symbolName}}.spec",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    return `import { Store } from "@tsed/core";
import { ${symbolName} } from "./${data.symbolPathBasename}.js";

describe("${symbolName}", () => {
  it("should store options", () => {
    class Test {
      @${symbolName}({options: "options"})
      property: string;
    }

    const store = Store.from(Test, "property");

    expect(store.get(${symbolName})).toEqual({options: "options"});
  });
});
`;
  }
});
