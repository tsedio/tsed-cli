import {join} from "node:path";

import {CliExeca, CliFs, ProjectPackageJson} from "@tsed/cli-core";
import {inject, injectable} from "@tsed/di";

export class CliPrisma {
  protected cliExeca = inject(CliExeca);
  protected cliFs = inject(CliFs);
  protected projectPackageJson = inject(ProjectPackageJson);

  run(command: string, args: string[] = [], options: any = {}) {
    return this.cliExeca.run("npx", ["prisma", command, ...args], {
      ...options,
      cwd: this.projectPackageJson.dir
    });
  }

  init() {
    return this.run("init");
  }

  async patchPrismaSchema() {
    const schemaPath = join(this.projectPackageJson.dir, "prisma", "schema.prisma");

    if (this.cliFs.fileExistsSync(schemaPath)) {
      let content = await this.cliFs.readFile(schemaPath, "utf8");

      if (!content.includes("generator tsed")) {
        content += "\ngenerator tsed {\n" + '  provider = "tsed-prisma"\n' + "}\n";
        content +=
          "\nmodel User {\n" +
          "  id    Int     @default(autoincrement()) @id\n" +
          "  email String  @unique\n" +
          "  name  String?\n" +
          "}\n";

        return this.cliFs.writeFile(schemaPath, content, {encoding: "utf8"});
      }
    }
  }
}

injectable(CliPrisma);
