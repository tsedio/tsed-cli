import {defineTemplate, type GenerateCmdContext} from "@tsed/cli";

export default defineTemplate({
  id: "generic.spec",
  label: "Generic Spec",
  fileName: "{{symbolName}}.spec",
  outputDir: "{{srcDir}}",
  hidden: true,

  render(symbolName: string, data: GenerateCmdContext) {
    return `import { expect, describe, it, beforeEach, afterEach } from "vitest";
import { PlatformTest, inject } from "@tsed/platform-http/testing";
import { ${symbolName} } from "./${data.symbolPathBasename}.js";

describe("${symbolName}", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = inject(${symbolName});
    // const instance = PlatformTest.invoke<${symbolName}>(${symbolName}); // get fresh instance

    expect(instance).toBeInstanceOf(${symbolName});
  });
});
`;
  }
});
