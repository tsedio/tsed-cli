import {CliConfiguration} from "@tsed/cli-core";
import {InjectorService} from "@tsed/di";
import {Logger} from "@tsed/logger";
import {createInjector} from "./createInjector";

describe("createInjector", () => {
  it("should create the injector", () => {
    const injector = createInjector();

    expect(injector).toBeInstanceOf(InjectorService);
    expect(injector.settings).toBeInstanceOf(CliConfiguration);
    expect(injector.logger).toBeInstanceOf(Logger);
  });
});
