import {insertImport} from "./insertImport.js";

describe("insertImport", () => {
  it("should inject import", () => {
    const fileContent =
      "#!/usr/bin/env node\n" +
      'import {CliCore} from "@tsed/cli-core";\n' +
      'import {config} from "../config.js";\n' +
      "\n" +
      "CliCore.bootstrap({\n" +
      "  ...config,\n" +
      "  commands: [\n" +
      "  ]\n" +
      "}).catch(console.error);";

    const result = insertImport(fileContent, 'import {HelloCmd} from "./HelloCmd.js";');

    expect(result).toEqual(
      "#!/usr/bin/env node\n" +
        'import {CliCore} from "@tsed/cli-core";\n' +
        'import {config} from "../config.js";\n' +
        'import {HelloCmd} from "./HelloCmd.js";\n' +
        "\n" +
        "CliCore.bootstrap({\n" +
        "  ...config,\n" +
        "  commands: [\n" +
        "  ]\n" +
        "}).catch(console.error);"
    );
  });
});
