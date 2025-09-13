import {join} from "node:path";

import {CliDockerComposeYaml, CliFs, ProjectPackageJson} from "@tsed/cli-core";
import {isString} from "@tsed/core";
import {constant, inject} from "@tsed/di";
import {
  type KindToNodeMappings,
  ObjectLiteralExpression,
  type OptionalKind,
  Project,
  type ProjectOptions,
  type SourceFile,
  type SourceFileCreateOptions,
  type SourceFileStructure,
  SyntaxKind,
  type WriterFunction
} from "ts-morph";

import {OutputFilePathPipe} from "../pipes/OutputFilePathPipe.js";

export class ProjectClient extends Project {
  readonly pkg = inject(ProjectPackageJson);
  readonly fs = inject(CliFs);
  readonly dockerCompose = inject(CliDockerComposeYaml);

  rootDir: string;

  constructor({rootDir, ...options}: ProjectOptions & {rootDir: string}) {
    super({
      fileSystem: inject(CliFs),
      ...options
    });

    this.rootDir = rootDir;
  }

  get srcDir() {
    return constant("project.srcDir", "/src");
  }

  get serverSourceFile() {
    return this.getSource(join(this.srcDir, this.serverName));
  }

  get configSourceFile() {
    return this.getSource(join(this.srcDir, `config/config.ts`));
  }

  get indexSourceFile() {
    return this.getSource(join(this.srcDir, "index.ts"));
  }

  get binSourceFile() {
    return this.getSource(join(this.srcDir, "bin/index.ts"));
  }

  get serverName() {
    return inject(OutputFilePathPipe).getServerName();
  }

  getSource(path: string) {
    const resolved = join(this.rootDir, path.replace("{{srcDir}}", this.srcDir));

    return this.getSourceFile(resolved);
  }

  async createSource(
    path: string,
    sourceFileText?: string | OptionalKind<SourceFileStructure> | WriterFunction,
    options?: SourceFileCreateOptions
  ) {
    path = join(this.rootDir, path);

    if (path.endsWith(".ts") || path.endsWith(".mts")) {
      const source = this.createSourceFile(path, sourceFileText, options);

      source.organizeImports();
      await source.save();

      return source;
    }

    await this.fs.writeFile(path, sourceFileText, {encoding: "utf-8"});
  }

  findClassDecorator(sourceFile: SourceFile, name: string) {
    return sourceFile
      .getClasses()
      .flatMap((cls) => cls.getDecorators())
      .find((decorator) => decorator.getName() === name);
  }

  addMountPath(path: string, specifier: string) {
    if (!this.serverSourceFile) {
      return;
    }
    const options = this.findConfigurationDecorationOptions();

    if (!options) {
      return;
    }

    let mount = this.getPropertyAssignment(options, {
      name: "mount",
      kind: SyntaxKind.ObjectLiteralExpression,
      initializer: "{}"
    });

    const escape = '"' + ((path || "").startsWith("/") ? path : "/" + path) + '"';

    const property = this.getPropertyAssignment(mount, {
      name: escape,
      kind: SyntaxKind.ArrayLiteralExpression,
      initializer: "[]"
    });

    if (isString(specifier)) {
      property.addElement(specifier);
    }

    options.formatText({
      indentSize: 2
    });
  }

  addNamespaceImport(sourceFile: SourceFile, moduleSpecifier: string, name: string) {
    return sourceFile
      .addImportDeclaration({
        moduleSpecifier,
        namespaceImport: name
      })
      .getNamespaceImport();
  }

  findConfiguration(kind: "server" | "config" | "bin"): ObjectLiteralExpression | undefined {
    switch (kind) {
      case "server":
        return this.findConfigurationDecorationOptions();
      case "config":
        return this.findConfigConfiguration();
      case "bin":
        return this.findBinConfiguration();
      default:
        throw new Error(`Unknown configuration kind: ${kind}`);
    }
  }

  getPropertyAssignment<TKind extends SyntaxKind>(
    input: ObjectLiteralExpression,
    {
      name,
      initializer,
      kind
    }: {
      name: string;
      initializer: string | WriterFunction;
      kind: TKind;
    }
  ): KindToNodeMappings[TKind];

  getPropertyAssignment<TKind extends SyntaxKind>(
    input: ObjectLiteralExpression,
    {
      name,
      initializer,
      kind
    }: {
      name: string;
      initializer?: string | WriterFunction;
      kind: TKind;
    }
  ): KindToNodeMappings[TKind] | undefined;

  getPropertyAssignment<TKind extends SyntaxKind>(
    input: ObjectLiteralExpression,
    {
      name,
      initializer,
      kind
    }: {
      name: string;
      initializer?: string | WriterFunction;
      kind: TKind;
    }
  ) {
    const assigment = input.getProperty(name)?.getChildAtIndex(2).asKind<TKind>(kind);

    if (!initializer) {
      return assigment;
    }

    return (
      assigment ||
      input
        .addPropertyAssignment({
          name,
          initializer
        })
        .getInitializerIfKindOrThrow<TKind>(kind)
    );
  }

  protected findConfigurationDecorationOptions() {
    if (!this.serverSourceFile) {
      return;
    }

    return this.findClassDecorator(this.serverSourceFile!, "Configuration")?.getArguments().at(0) as ObjectLiteralExpression | undefined;
  }

  protected findConfigConfiguration() {
    const sourceFile = this.configSourceFile;

    if (!sourceFile) {
      return;
    }

    return sourceFile.getVariableDeclaration("config")?.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  }

  protected findBinConfiguration() {
    if (!this.binSourceFile) {
      return;
    }

    for (const child of this.binSourceFile.getStatements()) {
      if (child.getKind() === SyntaxKind.ExpressionStatement && child.getText().includes("CliCore.bootstrap")) {
        return child.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);
      }
    }

    return undefined;
  }

  addConfigSource(name: string, {content = name, moduleSpecifier}: {content?: string; moduleSpecifier: string}) {
    const sourceFile = this.configSourceFile!;
    const options = this.findConfiguration("config");

    if (!options) {
      return;
    }

    const extendsConfig = this.getPropertyAssignment(options, {
      name: "extends",
      kind: SyntaxKind.ArrayLiteralExpression,
      initializer: "[]"
    });

    const has = extendsConfig.getElements().some((expression) => {
      return expression.getText().includes(name);
    });

    if (!has) {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: [{name: name}]
      });

      extendsConfig.addElement("\n" + content);
    }
  }
}
