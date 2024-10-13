import {PackageManagersModule} from "@tsed/cli-core";
// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {catchError} from "@tsed/core";

import {InitCmd} from "../../../src/commands/init/InitCmd.js";
import {RuntimesModule} from "../../runtimes/RuntimesModule.js";

async function getServiceFixture() {
  const packageManagers = {
    list: vi.fn().mockReturnValue([])
  };

  const runtimes = {
    list: vi.fn().mockReturnValue(["node"])
  };

  const service = await CliPlatformTest.invoke<InitCmd>(InitCmd, [
    {
      token: PackageManagersModule,
      use: packageManagers
    },
    {
      token: RuntimesModule,
      use: runtimes
    }
  ]);

  return {service, packageManagers, runtimes};
}

describe("InitCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());
  describe("checkPrecondition()", () => {
    it("should throw error (platform)", async () => {
      const {service} = await getServiceFixture();
      const result = catchError(() => {
        service.checkPrecondition({
          platform: "wrong"
        } as any);
      });
      expect(result?.message).toEqual("Invalid selected platform: wrong. Possible values: express, koa.");
    });

    it("should throw error (architecture)", async () => {
      const {service} = await getServiceFixture();

      const result = catchError(() => {
        service.checkPrecondition({
          architecture: "wrong"
        } as any);
      });
      expect(result?.message).toEqual("Invalid selected architecture: wrong. Possible values: arc_default, feature.");
    });

    it("should throw error (convention)", async () => {
      const {service} = await getServiceFixture();

      const result = catchError(() => {
        service.checkPrecondition({
          convention: "wrong"
        } as any);
      });
      expect(result?.message).toEqual("Invalid selected convention: wrong. Possible values: conv_default, angular.");
    });

    it("should not throw error (package manager)", async () => {
      const {service, packageManagers} = await getServiceFixture();

      packageManagers.list.mockReturnValue(["npm"]);

      const result = catchError(() => {
        service.checkPrecondition({
          runtime: "node",
          packageManager: "npm"
        } as any);
      });

      expect(result?.message).toEqual(undefined);
    });

    it("should throw error (package manager)", async () => {
      const {service, packageManagers} = await getServiceFixture();

      packageManagers.list.mockReturnValue(["yarn", "npm", "pnpm"]);

      const result = catchError(() => {
        service.checkPrecondition({
          runtime: "node",
          packageManager: "unknown"
        } as any);
      });
      expect(result?.message).toEqual("Invalid selected package manager: unknown. Possible values: yarn, npm, pnpm.");
    });

    it("should throw error (runtime)", async () => {
      const {service, packageManagers} = await getServiceFixture();

      packageManagers.list.mockReturnValue(["yarn", "npm", "pnpm"]);

      const result = catchError(() => {
        service.checkPrecondition({
          packageManager: "unknown"
        } as any);
      });
      expect(result?.message).toEqual("Invalid selected runtime: undefined. Possible values: node.");
    });

    it("should throw error (runtime-2)", async () => {
      const {service, packageManagers} = await getServiceFixture();

      packageManagers.list.mockReturnValue(["yarn", "npm", "pnpm"]);

      const result = catchError(() => {
        service.checkPrecondition({
          runtime: "unknown",
          packageManager: "unknown"
        } as any);
      });
      expect(result?.message).toEqual("Invalid selected runtime: unknown. Possible values: node.");
    });

    it("should throw error (features)", async () => {
      const {service, packageManagers} = await getServiceFixture();

      packageManagers.list.mockReturnValue(["yarn", "npm", "pnpm"]);

      const result = catchError(() => {
        service.checkPrecondition({
          packageManager: "yarn",
          runtime: "node",
          features: ["wrong"]
        } as any);
      });
      expect(result?.message).toContain("Invalid selected feature: wrong. Possible values: ");
    });
  });
});
