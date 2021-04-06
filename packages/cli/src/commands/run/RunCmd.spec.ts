import {CliPlatformTest} from "@tsed/cli-testing";
import {RunCmd} from "./RunCmd";
import {CliExeca, CliFs} from "@tsed/cli-core";

xdescribe("RunCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("$exec()", () => {
    it("should run sub project command (development)", async () => {
      const cliExeca = {
        runSync: jest.fn()
      };
      const cliFs = {
        exists: jest.fn().mockReturnValue(false)
      };
      const command = await CliPlatformTest.invoke<RunCmd>(RunCmd, [
        {
          token: CliExeca,
          use: cliExeca
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
      expect(cliExeca.runSync).toHaveBeenCalledWith("ts-node", ["-r", "tsconfig-paths/register", "src/bin/index.ts", "do", "-o"], {
        cwd: command.projectPackageJson.dir,
        env: {
          ...process.env
        },
        stdio: ["inherit"]
      });
    });
    it("should run sub project command (production)", async () => {
      const cliExeca = {
        runSync: jest.fn()
      };
      const cliFs = {
        exists: jest.fn().mockReturnValue(false)
      };
      const command = await CliPlatformTest.invoke<RunCmd>(RunCmd, [
        {
          token: CliExeca,
          use: cliExeca
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
      expect(cliExeca.runSync).toHaveBeenCalledWith("node", ["dist/bin/index.js", "do", "-o"], {
        cwd: command.projectPackageJson.dir,
        env: {
          ...process.env,
          NODE_ENV: "production"
        },
        stdio: ["inherit"]
      });
    });
    it("should run sub project command (production + tsconfig)", async () => {
      const cliExeca = {
        runSync: jest.fn()
      };
      const cliFs = {
        exists: jest.fn().mockReturnValue(true),
        readFile: jest.fn().mockResolvedValue(JSON.stringify({compilerOptions: {outDir: "./lib"}}))
      };
      const command = await CliPlatformTest.invoke<RunCmd>(RunCmd, [
        {
          token: CliExeca,
          use: cliExeca
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
      expect(cliExeca.runSync).toHaveBeenCalledWith("node", ["lib/bin/index.js", "do", "-o"], {
        cwd: command.projectPackageJson.dir,
        env: {
          ...process.env,
          NODE_ENV: "production"
        },
        stdio: ["inherit"]
      });
    });
  });
});
