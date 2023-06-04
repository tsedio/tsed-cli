import {CliPlatformTest} from "@tsed/cli-testing";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import runScript from "@npmcli/run-script";
import {CliRunScript} from "./CliRunScript";

jest.mock("@npmcli/run-script");

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
