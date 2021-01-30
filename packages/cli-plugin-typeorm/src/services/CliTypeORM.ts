import {CliExeca, Inject, ProjectPackageJson, SrcRendererService} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {camelCase, constantCase} from "change-case";
import {basename, join} from "path";
import {TEMPLATE_DIR} from "../utils/templateDir";

@Injectable()
export class CliTypeORM {
  @Inject()
  cliExeca: CliExeca;

  @Inject()
  projectPackageJson: ProjectPackageJson;

  @Inject()
  protected srcRenderer: SrcRendererService;

  run(command: string, args: string[], options: any = {}) {
    return this.cliExeca.run("npx", ["typeorm", command, ...args], {
      ...options,
      cwd: this.projectPackageJson.dir
    });
  }

  async generateConnection(name: string, options: any = {}) {
    return this.srcRenderer.render(
      "connection.hbs",
      {
        ...options,
        symbolName: constantCase(options.symbolName),
        connectionName: name
      },
      {
        templateDir: TEMPLATE_DIR,
        output: `${options.symbolPath}.ts`,
        rootDir: join(this.srcRenderer.rootDir, "services", "connections")
      }
    );
  }

  async writeConfig(name: string, database: string) {
    const {InitCommand} = await this.projectPackageJson.importModule("typeorm/commands/InitCommand.js");

    const content = {
      name,
      ...JSON.parse(await InitCommand.getOrmConfigTemplate(database))
    };

    function replace(path: string | undefined) {
      return path && path.replace("src/", "${rootDir}/").replace(/\.ts/, ".{js,ts}");
    }

    content.entities = content.entities?.map(replace);
    content.migrations = content.migrations?.map(replace);
    content.subscribers = content.subscribers?.map(replace);

    if (content.cli) {
      content.cli.entitiesDir = replace(content.cli.entitiesDir);
      content.cli.migrationsDir = replace(content.cli.migrationsDir);
      content.cli.subscribersDir = replace(content.cli.subscribersDir);
    }

    await this.srcRenderer.write(JSON.stringify(content, null, 2), {output: `config/typeorm/${name}.config.json`});

    return this.regenerateIndexConfig();
  }

  async regenerateIndexConfig() {
    const list = await this.srcRenderer.scan(["config/typeorm/*.config.json"]);

    const configs = list.map((file: string) => {
      const name = basename(file).replace(/\.config\.json/gi, "");

      return {
        name,
        symbolName: camelCase(name)
      };
    });

    return this.srcRenderer.render(
      "index.hbs",
      {
        configs
      },
      {
        templateDir: TEMPLATE_DIR,
        output: "index.ts",
        rootDir: join(this.srcRenderer.rootDir, "config", "typeorm")
      }
    );
  }
}
