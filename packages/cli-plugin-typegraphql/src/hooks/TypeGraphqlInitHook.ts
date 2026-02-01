import {type CliCommandHooks, exec, type InitCmdContext, ProjectClient, type RenderDataContext} from "@tsed/cli";
import {type Task} from "@tsed/cli-core";
import {injectable} from "@tsed/di";
import {SyntaxKind} from "ts-morph";

export class TypeGraphqlInitHook implements CliCommandHooks {
  async $alterInitSubTasks(tasks: Task[], data: InitCmdContext) {
    return [
      ...tasks,
      {
        title: "Generate initial resolver",
        enabled: () => !!data.graphql,
        task: () =>
          exec("generate", {
            ...data,
            type: "typegraphql.resolver",
            name: "Recipe"
          })
      }
    ];
  }

  $alterProjectFiles(project: ProjectClient, data: RenderDataContext) {
    if (!data.graphql) {
      return project;
    }

    if (data.commandName !== "init") {
      return project;
    }

    if (project.serverSourceFile) {
      project.serverSourceFile.addImportDeclaration({
        moduleSpecifier: "@tsed/typegraphql"
      });
      project.serverSourceFile.addImportDeclaration({
        moduleSpecifier: "./graphql/datasources/index.js"
      });
      project.serverSourceFile.addImportDeclaration({
        moduleSpecifier: "./graphql/resolvers/index.js"
      });
    }

    const options = project.findConfiguration("config");

    if (!options) {
      return project;
    }

    const graphql = project.getPropertyAssignment(options, {
      name: "graphql",
      kind: SyntaxKind.ObjectLiteralExpression,
      initializer: "{}"
    });

    const defaultGraphql = project.getPropertyAssignment(graphql, {
      name: "default",
      kind: SyntaxKind.ObjectLiteralExpression,
      initializer: "{}"
    });
    project.getPropertyAssignment(defaultGraphql, {
      name: "path",
      kind: SyntaxKind.StringLiteral,
      initializer: '"/graphql"'
    });
    project.getPropertyAssignment(defaultGraphql, {
      name: "buildSchemaOptions",
      kind: SyntaxKind.ObjectLiteralExpression,
      initializer: "{}"
    });

    return project;
  }
}

injectable(TypeGraphqlInitHook);
