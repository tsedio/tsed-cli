import {Cli, createInjector, loadInjector} from "@tsed/cli-core";
import {Env} from "@tsed/core";
import {InjectorService, LocalsContainer, OnInit, TokenProvider} from "@tsed/di";

export interface IInvokeOptions {
  token?: TokenProvider;
  /**
   * @deprecated
   */
  provide?: TokenProvider;
  use: any;
}

export class CliTestContext {
  private static _injector: InjectorService | null = null;

  static get injector(): InjectorService {
    if (this._injector) {
      return this._injector!;
    }

    /* istanbul ignore next */
    throw new Error(
      "CliTestContext.injector is not initialized. Use CliTestContext.create(): Promise before CliTestContext.invoke() or CliTestContext.injector.\n" +
        "Example:\n" +
        "before(async () => {\n" +
        "   await CliTestContext.create()\n" +
        "   await CliTestContext.invoke(MyService, [])\n" +
        "})"
    );
  }

  static async create(options: Partial<TsED.Configuration> = {}) {
    CliTestContext._injector = CliTestContext.createInjector(options);
    await loadInjector(CliTestContext._injector, Cli);
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
      },
      project: {
        root: "./tmp",
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
    if (CliTestContext._injector) {
      await CliTestContext._injector.destroy();
      CliTestContext._injector = null;
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
      if (!CliTestContext._injector) {
        await CliTestContext.create();
      }

      const injector: InjectorService = CliTestContext.injector;
      const deps = [];

      for (const target of targets) {
        deps.push(injector.has(target) ? injector.get(target) : await injector.invoke(target));
      }

      return await func(...deps);
    };
  }

  static invoke<T = any>(target: TokenProvider, providers: IInvokeOptions[]): T | Promise<T> {
    const locals = new LocalsContainer();
    providers.forEach(p => {
      locals.set(p.token || p.provide, p.use);
    });

    const instance: OnInit = CliTestContext.injector.invoke(target, locals, {rebuild: true});

    if (instance && instance.$onInit) {
      // await instance.$onInit();
      const result = instance.$onInit();
      if (result instanceof Promise) {
        return result.then(() => instance as any);
      }
    }

    return instance as any;
  }
}
