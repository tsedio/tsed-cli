import {
  Cli,
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
  LocalsContainer,
  OnInit,
  TokenProvider
} from "@tsed/cli-core";
import {FakeCliExeca} from "./FakeCliExeca";
import {FakeCliFs} from "./FakeCliFs";
import {FakeCliHttpClient} from "./FakeCliHttpClient";

export interface InvokeOptions {
  token: TokenProvider;
  use: any;
}

export class CliPlatformTest {
  private static _injector: InjectorService | null = null;

  static get injector(): InjectorService {
    if (this._injector) {
      return this._injector;
    }

    /* istanbul ignore next */
    throw new Error(
      "CliPlatformTest.injector is not initialized. Use CliPlatformTest.create(): Promise before CliPlatformTest.invoke() or CliPlatformTest.injector.\n" +
        "Example:\n" +
        "before(async () => {\n" +
        "   await CliPlatformTest.create()\n" +
        "   await CliPlatformTest.invoke(MyService, [])\n" +
        "})"
    );
  }

  static async bootstrap(options: Partial<TsED.Configuration> = {}) {
    CliPlatformTest._injector = CliPlatformTest.createInjector({
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

    await loadInjector(CliPlatformTest._injector, Cli, container);

    await CliPlatformTest._injector.emit("$onReady");

    CliPlatformTest.get(CliService).load();
  }

  static async create(options: Partial<TsED.Configuration> = {}) {
    CliPlatformTest._injector = CliPlatformTest.createInjector(options);
    await loadInjector(CliPlatformTest._injector, Cli);
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
   * Resets the test injector of the test context, so it won't pollute your next test. Call this in your `tearDown` logic.
   */
  static async reset() {
    if (CliPlatformTest._injector) {
      await CliPlatformTest._injector.destroy();
      CliPlatformTest._injector = null;
    }
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
      if (!CliPlatformTest._injector) {
        await CliPlatformTest.create();
      }

      const injector: InjectorService = CliPlatformTest.injector;
      const deps = [];

      for (const target of targets) {
        deps.push(injector.has(target) ? injector.get(target) : await injector.invoke(target));
      }

      return await func(...deps);
    };
  }

  static invoke<T = any>(target: TokenProvider, providers: InvokeOptions[]): T | Promise<T> {
    const locals = new LocalsContainer();
    providers.forEach((p) => {
      locals.set(p.token, p.use);
    });

    const instance: OnInit = CliPlatformTest.injector.invoke(target, locals, {rebuild: true});

    if (instance && instance.$onInit) {
      // await instance.$onInit();
      const result = instance.$onInit();
      if (result instanceof Promise) {
        return result.then(() => instance as any);
      }
    }

    return instance as any;
  }

  /**
   * Return the instance from injector registry
   * @param target
   * @param options
   */
  static get<T = any>(target: TokenProvider): T {
    return CliPlatformTest.injector.get<T>(target)!;
  }
}
