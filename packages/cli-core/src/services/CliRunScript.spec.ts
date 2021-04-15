import {CliPlatformTest} from "@tsed/cli-testing";
import {CliRunScript} from "./CliRunScript";

jest.mock("@npmcli/run-script");

const runScript = require("@npmcli/run-script");

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
