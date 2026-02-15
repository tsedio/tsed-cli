// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliFs} from "./CliFs.js";
import {CliYaml} from "./CliYaml.js";

describe("CliYaml", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should parse yaml files via CliFs", async () => {
    const fs = {
      readFile: vi.fn().mockResolvedValue("name: cli")
    };
    const service = await CliPlatformTest.invoke<CliYaml>(CliYaml, [
      {
        token: CliFs,
        use: fs
      }
    ]);

    const result = await service.read("settings.yml");

    expect(fs.readFile).toHaveBeenCalledWith("settings.yml", {encoding: "utf8"});
    expect(result).toEqual({name: "cli"});
  });

  it("should serialize objects to yaml before writing", async () => {
    const fs = {
      writeFile: vi.fn().mockResolvedValue(undefined)
    };
    const service = await CliPlatformTest.invoke<CliYaml>(CliYaml, [
      {
        token: CliFs,
        use: fs
      }
    ]);

    await service.write("settings.yml", {name: "cli"});

    expect(fs.writeFile).toHaveBeenCalledWith("settings.yml", "name: cli\n", {encoding: "utf8"});
  });
});
