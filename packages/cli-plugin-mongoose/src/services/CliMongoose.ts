import {ProjectClient, render, type RenderDataContext} from "@tsed/cli";
import {inject, injectable, ProjectPackageJson} from "@tsed/cli-core";
import {camelCase} from "change-case";
import {SyntaxKind} from "ts-morph";

export class CliMongoose {
  protected projectPackageJson = inject(ProjectPackageJson);

  async createMongooseConnection(project: ProjectClient, name: string) {
    const obj = await render("mongoose.connection", {name});

    return this.updateMongooseConfig(project, obj!.symbolName!);
  }

  async updateMongooseConfig(project: ProjectClient, name: string) {
    const connectionSource = project.getSource(`{{srcDir}}/config/mongoose/${name}.ts`);

    const {options, source} = await this.getMongooseConfig(project);

    if (options && connectionSource) {
      source.addImportDeclaration({
        moduleSpecifier: `./${name}.js`,
        defaultImport: camelCase(name)
      });

      options.addElement(camelCase(name));
    }
  }

  async getMongooseConfig(project: ProjectClient) {
    let source = project.getSource("{{srcDir}}/config/mongoose/index.ts");

    if (!source) {
      source = (await render("mongoose.index", {
        name: "index"
      }))!.source!;
    }

    // get default export options
    const defaultExport = source.getStatement((statement) => {
      return statement.isKind(SyntaxKind.ExportAssignment);
    });

    return {source, options: defaultExport?.getFirstDescendantByKind(SyntaxKind.ArrayLiteralExpression)};
  }

  updateConfigFile(project: ProjectClient, data: RenderDataContext) {
    const options = project.findConfiguration("config");
    const configFile = project.configSourceFile;

    if (!configFile || !options) {
      return;
    }

    // set that in config.ts
    configFile.addImportDeclaration({
      moduleSpecifier: "./mongoose/index.js",
      defaultImport: "mongooseConfig"
    });

    project.getPropertyAssignment(options, {
      name: "mongoose",
      kind: SyntaxKind.Identifier,
      initializer: "mongooseConfig"
    });
  }
}

injectable(CliMongoose);
