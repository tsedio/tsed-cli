// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {DevCmd} from "./DevCmd.js";

describe("DevCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should delegate to vite runtime runner", async () => {
    const command = await CliPlatformTest.invoke<DevCmd>(DevCmd);

    const runViteDev = vi.spyOn(command as any, "runViteDev").mockResolvedValue(undefined);

    await command.$exec({
      rawArgs: ["--watch=false"]
    });

    expect(runViteDev).toHaveBeenCalledWith(["--watch=false"]);
  });
});
