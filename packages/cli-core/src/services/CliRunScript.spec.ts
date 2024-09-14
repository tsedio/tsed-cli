// @ts-ignore

// @ts-ignore
import runScript from "@npmcli/run-script";
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliRunScript} from "./CliRunScript";

vi.mock("@npmcli/run-script");

describe("CliRunScript", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should run a script", () => {
    const service = CliPlatformTest.get<CliRunScript>(CliRunScript);

    service.run("ts-node", ["-o"], {
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
