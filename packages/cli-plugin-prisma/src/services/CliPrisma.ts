import {CliExeca, CliFs, Inject, ProjectPackageJson} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";

@Injectable()
export class CliPrisma {
  @Inject()
  protected cliExeca: CliExeca;

  @Inject()
  protected cliFs: CliFs;

  @Inject()
  protected projectPackageJson: ProjectPackageJson;

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
    const schemaPath = this.cliFs.join(this.projectPackageJson.dir, "prisma", "schema.prisma");

    if (this.cliFs.exists(schemaPath)) {
      let content = await this.cliFs.readFile(schemaPath, "utf8");

      if (!content.includes("generator tsed")) {
        content += "\ngenerator tsed {\n" + '  provider = "tsed-prisma"\n' + "}\n";

        return this.cliFs.writeFile(schemaPath, content, {encoding: "utf8"});
      }
    }
  }
}
