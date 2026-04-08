// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliRunScript} from "../../services/CliRunScript.js";
import {BuildCmd} from "./BuildCmd.js";

describe("BuildCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should run vite build and forward args for vite runtime", async () => {
    const runScript = {
      run: vi.fn()
    };

    const command = await CliPlatformTest.invoke<BuildCmd>(BuildCmd, [
      {
        token: CliRunScript,
        use: runScript
      }
    ]);

    await command.$exec({
      rawArgs: ["--mode", "production"]
    });

    expect(runScript.run).toHaveBeenCalledTimes(1);
    expect(runScript.run).toHaveBeenNthCalledWith(1, "vite build", ["--mode", "production"], {
      env: {
        ...process.env
      }
    });
  });
});
