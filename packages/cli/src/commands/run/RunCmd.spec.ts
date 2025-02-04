ou// @ts-ignore
import {CliFs, CliRunScript} from "@tsed/cli-core";
// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {RunCmd} from "./RunCmd.js";

describe("RunCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("$exec()", () => {
    it("should run sub project command (development)", async () => {
      const runScript = {
        run: vi.fn()
      };
      const cliFs = {
        exists: vi.fn().mockReturnValue(false)
      };
      const command = await CliPlatformTest.invoke<RunCmd>(RunCmd, [
        {
          token: CliRunScript,
          use: runScript
        },
        {
          token: CliFs,
          use: cliFs
        }
      ]);

      const ctx = {
        production: false,
        command: "do",
        rawArgs: ["-o"]
      };

      await command.$exec(ctx as any);
      expect(runScript.run).toHaveBeenCalledWith("node", ["--import", "@swc-node/register/esm-register", "src/bin/index.ts", "do", "-o"], {
        env: {
          ...process.env
        }
      });
    });
    it("should run sub project command (production)", async () => {
      const runScript = {
        run: vi.fn()
      };
      const cliFs = {
        exists: vi.fn().mockReturnValue(false)
      };
      const command = await CliPlatformTest.invoke<RunCmd>(RunCmd, [
        {
          token: CliRunScript,
          use: runScript
        },
        {
          token: CliFs,
          use: cliFs
        }
      ]);

      const ctx = {
        production: true,
        command: "do",
        rawArgs: ["-o"]
      };

      await command.$exec(ctx as any);
      expect(runScript.run).toHaveBeenCalledWith("node", ["--import", "@swc-node/register/esm-register", "src/bin/index.ts", "do", "-o"], {
        env: {
          ...process.env
        }
      });
    });
  });
});
