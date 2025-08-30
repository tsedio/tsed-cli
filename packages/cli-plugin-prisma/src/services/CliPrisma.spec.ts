import {join} from "node:path";

import {CliFs, normalizePath} from "@tsed/cli-core";
// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliPrisma} from "./CliPrisma.js";

async function createServiceFixture() {
  const cliFs = {
    join: (...args: string[]) => normalizePath(join(...args)),
    fileExistsSync: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn()
  };

  const service = await CliPlatformTest.invoke<CliPrisma>(CliPrisma, [
    {
      token: CliFs,
      use: cliFs
    }
  ]);

  return {service, cliFs};
}

describe("CliPrisma", () => {
  beforeEach(() =>
    CliPlatformTest.create({
      name: "tsed"
    })
  );
  afterEach(CliPlatformTest.reset);
  describe("patchPrismaSchema()", () => {
    it("should patch the schema", async () => {
      const {service, cliFs} = await createServiceFixture();
      const schema =
        "datasource db {\n" +
        '  provider = "sqlite"\n' +
        '  url      = env("DATABASE_URL")\n' +
        "}\n" +
        "\n" +
        "generator client {\n" +
        '  provider = "prisma-client-js"\n' +
        "}\n";

      cliFs.fileExistsSync.mockReturnValue(true);
      cliFs.readFile.mockResolvedValue(schema);

      await service.patchPrismaSchema();

      expect(cliFs.writeFile.mock.calls[0][1]).toMatchSnapshot();
    });
    it("should not apply patch to the schema if it's already done", async () => {
      const {service, cliFs} = await createServiceFixture();
      const schema =
        "datasource db {\n" +
        '  provider = "sqlite"\n' +
        '  url      = env("DATABASE_URL")\n' +
        "}\n" +
        "\n" +
        "generator client {\n" +
        '  provider = "prisma-client-js"\n' +
        "}\n" +
        "\ngenerator tsed {\n" +
        '  provider = "tsed-prisma"\n' +
        "}\n";

      cliFs.fileExistsSync.mockReturnValue(true);
      cliFs.readFile.mockResolvedValue(schema);

      await service.patchPrismaSchema();

      expect(cliFs.writeFile).not.toHaveBeenCalled();
    });
    it("should do nothing", async () => {
      const {service, cliFs} = await createServiceFixture();
      const schema =
        "datasource db {\n" +
        '  provider = "sqlite"\n' +
        '  url      = env("DATABASE_URL")\n' +
        "}\n" +
        "\n" +
        "generator client {\n" +
        '  provider = "prisma-client-js"\n' +
        "}\n";

      cliFs.fileExistsSync.mockReturnValue(false);
      cliFs.readFile.mockResolvedValue(schema);

      await service.patchPrismaSchema();

      expect(cliFs.writeFile).not.toHaveBeenCalled();
    });
  });
});
