// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {RunCmd} from "./RunCmd";
import {CliFs, CliRunScript} from "@tsed/cli-core";

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
      expect(runScript.run).toHaveBeenCalledWith("ts-node", ["-r", "tsconfig-paths/register", "src/bin/index.ts", "do", "-o"], {
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
      expect(runScript.run).toHaveBeenCalledWith("node", ["dist/bin/index.js", "do", "-o"], {
        env: {
          ...process.env,
          NODE_ENV: "production"
        }
      });
    });
    it("should run sub project command (production + tsconfig)", async () => {
      const runScript = {
        run: vi.fn()
      };
      const cliFs = {
        exists: vi.fn().mockReturnValue(true),
        readFile: vi.fn().mockResolvedValue(JSON.stringify({compilerOptions: {outDir: "./lib"}})),
        readJsonSync: vi.fn().mockResolvedValue({})
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
      expect(runScript.run).toHaveBeenCalledWith("node", ["lib/bin/index.js", "do", "-o"], {
        env: {
          ...process.env,
          NODE_ENV: "production"
        }
      });
    });
  });
});
