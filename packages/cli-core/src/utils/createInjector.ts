import {GlobalProviders, IDIConfigurationOptions, IDILogger, InjectorService} from "@tsed/di";
import {CliConfiguration} from "../services/CliConfiguration";
import {Logger} from "../services/Logger";

export function createInjector(settings: Partial<IDIConfigurationOptions> = {}) {
  const injector = new InjectorService();
  injector.settings = createConfiguration(injector);
  injector.logger = createLogger(injector);

  // @ts-ignore
  injector.settings.set(settings);

  /* istanbul ignore next */
  if (injector.settings.env === "test") {
    injector.logger.stop();
  }

  return injector;
}

function createConfiguration(injector: InjectorService): CliConfiguration & TsED.Configuration {
  const provider = GlobalProviders.get(CliConfiguration)!.clone();

  provider.instance = injector.invoke<CliConfiguration>(provider.useClass);
  injector.addProvider(CliConfiguration, provider);

  return provider.instance as any;
}

function createLogger(injector: InjectorService): IDILogger {
  const provider = GlobalProviders.get(Logger)!.clone();

  provider.instance = injector.invoke<Logger>(provider.useClass);
  injector.addProvider(Logger, provider);

  return provider.instance as any;
}
