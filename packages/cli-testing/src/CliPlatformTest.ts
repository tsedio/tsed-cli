import "@tsed/logger-std";

import {
  CliCore,
  CliExeca,
  CliFs,
  CliHttpClient,
  CliService,
  configuration,
  createInjector,
  DITest,
  Env,
  getCommandMetadata,
  injector,
  InjectorService,
  logger,
  ProjectPackageJson,
  resolveConfiguration,
  type TokenProvider
} from "@tsed/cli-core";
import {Type} from "@tsed/core";
import {DIContext, runInContext} from "@tsed/di";
import {$asyncEmit} from "@tsed/hooks";
import {v4} from "uuid";

import {FakeCliExeca} from "./FakeCliExeca.js";
import {FakeCliFs} from "./FakeCliFs.js";
import {FakeCliHttpClient} from "./FakeCliHttpClient.js";

export class CliPlatformTest extends DITest {
  static async bootstrap(options: Partial<TsED.Configuration> = {}) {
    options = resolveConfiguration({
      name: "tsed",
      project: {
        rootDir: options.rootDir || "./project-name",
        srcDir: "src",
        scriptsDir: "scripts",
        ...(options.project || {})
      },
      ...options
    });

    CliPlatformTest.createInjector(options);

    injector()
      .addProvider(CliHttpClient, {
        useClass: FakeCliHttpClient
      })
      .addProvider(CliFs, {
        useClass: FakeCliFs
      })
      .addProvider(CliExeca, {
        useClass: FakeCliExeca
      })
      .addProvider(CliCore);

    await injector().load();
    await $asyncEmit("$onReady");
    await $asyncEmit("$loadPackageJson");

    CliPlatformTest.get(CliService).load();
  }

  static async create(options: Partial<TsED.Configuration> = {}, rootModule: Type = CliCore) {
    options = resolveConfiguration({
      name: "tsed",
      ...options
    });

    CliPlatformTest.createInjector(options);

    injector().addProvider(CliCore, {
      useClass: rootModule
    });

    await injector().load();
  }

  /**
   * Create a new injector with the right default services
   */
  static createInjector(options: Partial<TsED.Configuration> = {}): InjectorService {
    const injector = createInjector({
      ...options,
      pkg: {
        name: "@tsed/cli-testing",
        version: "1.0.0"
      } as any,
      project: {
        rootDir: "./tmp",
        srcDir: "src",
        ...(options.project || {})
      },
      disableReadUpPkg: true
    });

    injector.settings.env = Env.TEST;

    return injector;
  }

  static setPackageJson(pkg: any) {
    const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);

    (projectPackageJson as any).setRaw(pkg);
  }

  /**
   * Invoke command with a new context without running prompts
   * @param cmdName
   * @param initialData
   */
  static exec(cmdName: string, initialData: any) {
    const $ctx = new DIContext({
      id: v4(),
      injector: injector(),
      logger: logger()
    });

    const metadata = configuration()
      .get("commands")
      .map((token: TokenProvider) => getCommandMetadata(token))
      .find((commandOpts: any) => cmdName === commandOpts.name);

    $ctx.set("data", initialData);
    $ctx.set("command", metadata);

    return runInContext($ctx, () => this.injector.get<CliService>(CliService)!.exec(cmdName, initialData, $ctx));
  }
}
