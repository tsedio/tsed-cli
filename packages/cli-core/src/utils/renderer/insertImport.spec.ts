import {insertImport} from "./insertImport";

describe("insertImport", () => {
  it("should inject import", () => {
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

    const result = insertImport(fileContent, 'import {HelloCmd} from "./HelloCmd";');

    expect(result).toEqual(
      "#!/usr/bin/env node\n" +
        'import {CliCore} from "@tsed/cli-core";\n' +
        'import {config} from "../config";\n' +
        'import {HelloCmd} from "./HelloCmd";\n' +
        "\n" +
        "CliCore.bootstrap({\n" +
        "  ...config,\n" +
        "  commands: [\n" +
        "  ]\n" +
        "}).catch(console.error);"
    );
  });
});
