// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {constant} from "@tsed/di";

import {CliPackageJson as CliPackageJsonToken, cliPackageJson} from "./CliPackageJson.js";

describe("CliPackageJson provider", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should expose the current package.json via DI", () => {
    const expected = constant("pkg", {});
    const pkg = CliPlatformTest.get<typeof CliPackageJsonToken>(CliPackageJsonToken as any);

    expect(pkg).toEqual(expected);
  });

  it("should resolve through the cliPackageJson helper", () => {
    const expected = constant("pkg", {});
    const pkg = cliPackageJson();

    expect(pkg).toEqual(expected);
  });
});
