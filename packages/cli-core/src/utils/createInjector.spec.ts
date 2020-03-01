import {CliConfiguration} from "@tsed/cli-core";
import {InjectorService} from "@tsed/di";
import {Logger} from "@tsed/logger";
import {expect} from "chai";
import {createInjector} from "./createInjector";

describe("createInjector", () => {
  it("should create the injector", () => {
    const injector = createInjector();

    expect(injector).to.instanceOf(InjectorService);
    expect(injector.settings).to.instanceOf(CliConfiguration);
    expect(injector.logger).to.instanceOf(Logger);
  });
});
