// @ts-ignore
import runScript from "@npmcli/run-script";
// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliRunScript} from "./CliRunScript.js";

vi.mock("@npmcli/run-script");

describe("CliRunScript", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should run a script", async () => {
    const service = CliPlatformTest.get<CliRunScript>(CliRunScript);

    await service.run("ts-node", ["-o"], {
      env: {
        node: "env"
      }
    });

    expect(runScript).toHaveBeenCalledWith({
      banner: false,
      cmd: "ts-node -o",
      env: {node: "env"},
      event: "run",
      path: "./tmp",
      stdio: "inherit"
    });
  });
});
