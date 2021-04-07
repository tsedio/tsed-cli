import {insertAfter} from "./insertAfter";

describe("insertAfter", () => {
  it("should inject content after pattern", () => {
    const fileContent =
      "#!/usr/bin/env node\n" +
      'import {CliCore} from "@tsed/cli-core";\n' +
      'import {config} from "../config";\n' +
      "\n" +
      "CliCore.bootstrap({\n" +
      "  ...config,\n" +
      "  commands: [\n" +
      "  ]\n" +
      "}).catch(console.error);";

    const result = insertAfter(fileContent, "  HelloCmd", /commands: \[/);
    const result2 = insertAfter(result, "  HelloCmd2", /commands: \[/);

    expect(result2).toEqual(
      "#!/usr/bin/env node\n" +
        'import {CliCore} from "@tsed/cli-core";\n' +
        'import {config} from "../config";\n' +
        "\n" +
        "CliCore.bootstrap({\n" +
        "  ...config,\n" +
        "  commands: [\n" +
        "    HelloCmd2,\n" +
        "    HelloCmd\n" +
        "  ]\n" +
        "}).catch(console.error);"
    );
  });
});
