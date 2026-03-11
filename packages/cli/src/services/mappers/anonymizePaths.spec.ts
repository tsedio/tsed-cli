import {anonymizePaths} from "./anonymizePaths.js";

describe("anonymizePaths", () => {
  it("should keep paths relative to cwd and anonymize home/external absolute paths", () => {
    const stack = [
      "Error: test",
      "    at run (/Users/alice/work/tsed-cli/packages/cli/src/index.ts:10:2)",
      "    at fromUrl (file:///Users/alice/work/tsed-cli/packages/cli/src/services/mappers/anonymizePaths.ts:20:5)",
      "    at inHome (/Users/alice/.nvm/versions/node/v22.0.0/index.js:3:1)",
      "    at globalCli (/Users/alice/.nvm/versions/node/v22.0.0/lib/node_modules/@tsed/cli/lib/esm/bin/tsed.js:12:9)",
      "    at globalCore (/Users/alice/.nvm/versions/node/v22.0.0/lib/node_modules/@tsed/cli-core/lib/esm/index.js:2:1)",
      "    at external (/opt/homebrew/lib/node_modules/pkg/entry.js:8:4)",
      "    at Module.runMain (node:internal/modules/run_main:171:5)"
    ].join("\n");

    expect(
      anonymizePaths(stack, {
        cwd: "/Users/alice/work/tsed-cli",
        home: "/Users/alice"
      })
    ).toBe(
      [
        "Error: test",
        "    at run (<cwd>/packages/cli/src/index.ts:10:2)",
        "    at fromUrl (<cwd>/packages/cli/src/services/mappers/anonymizePaths.ts:20:5)",
        "    at inHome (~/.nvm/versions/node/v22.0.0/index.js:3:1)",
        "    at globalCli (<global>/@tsed/cli/lib/esm/bin/tsed.js:12:9)",
        "    at globalCore (<global>/@tsed/cli-core/lib/esm/index.js:2:1)",
        "    at external (<global>/pkg/entry.js:8:4)",
        "    at Module.runMain (node:internal/modules/run_main:171:5)"
      ].join("\n")
    );
  });

  it("should handle windows-like absolute paths", () => {
    const stack = [
      "Error: windows",
      "    at local (C:\\repo\\tsed-cli\\packages\\cli\\src\\main.ts:4:2)",
      "    at home (C:\\Users\\alice\\AppData\\Roaming\\npm\\index.js:5:9)",
      "    at globalCli (C:\\Users\\alice\\AppData\\Roaming\\npm\\node_modules\\@tsed\\cli\\lib\\esm\\bin\\tsed.js:3:7)",
      "    at globalPkg (C:\\Users\\alice\\AppData\\Roaming\\npm\\node_modules\\tsx\\dist\\cli.mjs:10:4)",
      "    at external (D:\\tools\\node_modules\\pkg\\entry.js:1:1)"
    ].join("\n");

    expect(
      anonymizePaths(stack, {
        cwd: "C:\\repo\\tsed-cli",
        home: "C:\\Users\\alice"
      })
    ).toBe(
      [
        "Error: windows",
        "    at local (<cwd>/packages/cli/src/main.ts:4:2)",
        "    at home (~/AppData/Roaming/npm/index.js:5:9)",
        "    at globalCli (<global>/@tsed/cli/lib/esm/bin/tsed.js:3:7)",
        "    at globalPkg (<global>/tsx/dist/cli.mjs:10:4)",
        "    at external (<global>/pkg/entry.js:1:1)"
      ].join("\n")
    );
  });

  it("should sanitize absolute paths inside plain error messages", () => {
    const message = "File not found: /Users/giedriusmajauskas/Documents/oldmac/vscode-workspaces/tsed/template-manage/src/Server.ts";

    expect(
      anonymizePaths(message, {
        cwd: "/Users/giedriusmajauskas/Documents/oldmac/vscode-workspaces/tsed/template-manage",
        home: "/Users/giedriusmajauskas"
      })
    ).toBe("File not found: <cwd>/src/Server.ts");
  });
});
