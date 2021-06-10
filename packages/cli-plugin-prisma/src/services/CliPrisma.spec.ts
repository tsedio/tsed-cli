import {CliPlatformTest} from "@tsed/cli-testing";
import {CliPrisma} from "./CliPrisma";
import {CliFs} from "@tsed/cli-core";
import {join} from "path";
import {normalizePath} from "@tsed/core";

async function createServiceFixture() {
  const cliFs = {
    join: (...args: string[]) => normalizePath(join(...args)),
    exists: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn()
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

      cliFs.exists.mockReturnValue(true);
      cliFs.readFile.mockResolvedValue(schema);

      await service.patchPrismaSchema();

      expect(cliFs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        schema + "\ngenerator tsed {\n" + '  provider = "tsed-prisma"\n' + "}\n",
        {encoding: "utf8"}
      );
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

      cliFs.exists.mockReturnValue(true);
      cliFs.readFile.mockResolvedValue(schema);

      await service.patchPrismaSchema();

      expect(cliFs.writeFile).not.toBeCalled();
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

      cliFs.exists.mockReturnValue(false);
      cliFs.readFile.mockResolvedValue(schema);

      await service.patchPrismaSchema();

      expect(cliFs.writeFile).not.toBeCalled();
    });
  });
});
