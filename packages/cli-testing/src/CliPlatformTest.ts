import {
  CliCore,
  CliExeca,
  CliFs,
  CliHttpClient,
  CliService,
  Container,
  createContainer,
  createInjector,
  Env,
  InjectorService,
  loadInjector,
  TokenProvider,
  DITest
} from "@tsed/cli-core";
import {Type} from "@tsed/core";
import {FakeCliExeca} from "./FakeCliExeca";
import {FakeCliFs} from "./FakeCliFs";
import {FakeCliHttpClient} from "./FakeCliHttpClient";

export interface InvokeOptions {
  token: TokenProvider;
  use: any;
}

export class CliPlatformTest extends DITest {
  static async bootstrap(options: Partial<TsED.Configuration> = {}, rootModule: Type = CliCore) {
    DITest.injector = CliPlatformTest.createInjector({
      name: "tsed",
      project: {
        rootDir: options.rootDir || "./project-name",
        srcDir: "src",
        scriptsDir: "scripts",
        ...(options.project || {})
      },
      ...options
    });

    const container: Container = createContainer();
    container.getProvider(CliHttpClient)!.useClass = FakeCliHttpClient;
    container.getProvider(CliFs)!.useClass = FakeCliFs;
    container.getProvider(CliExeca)!.useClass = FakeCliExeca;

    // await loadPlugins(CliPlatformTest._injector);

    await loadInjector(DITest.injector, rootModule, container);

    await DITest.injector.emit("$onReady");

    CliPlatformTest.get(CliService).load();
  }

  static async create(options: Partial<TsED.Configuration> = {}, rootModule: Type = CliCore) {
    DITest.injector = CliPlatformTest.createInjector({
      name: "tsed",
      ...options
    });
    await loadInjector(DITest.injector, rootModule);
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
      }
    });

    injector.settings.env = Env.TEST;

    return injector;
  }

  /**
   * It injects services into the test function where you can alter, spy on, and manipulate them.
   *
   * The inject function has two parameters
   *
   * * an array of Service dependency injection tokens,
   * * a test function whose parameters correspond exactly to each item in the injection token array.
   *
   * @param targets
   * @param func
   */
  static inject<T>(targets: any[], func: (...args: any[]) => Promise<T> | T): () => Promise<T> {
    return async (): Promise<T> => {
      if (!DITest.hasInjector()) {
        await CliPlatformTest.create();
      }

      const injector: InjectorService = DITest.injector;
      const deps = [];

      for (const target of targets) {
        deps.push(injector.has(target) ? injector.get(target) : await injector.invoke(target));
      }

      return await func(...deps);
    };
  }
}
