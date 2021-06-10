import {GlobalProviders, DIConfigurationOptions, DILogger, InjectorService} from "@tsed/di";
import {CliConfiguration} from "../services/CliConfiguration";
import {Logger} from "../services/Logger";
import {ProjectPackageJson} from "../services/ProjectPackageJson";

function createConfiguration(injector: InjectorService): CliConfiguration & TsED.Configuration {
  const provider = GlobalProviders.get(CliConfiguration)!.clone();

  provider.instance = injector.invoke<CliConfiguration>(provider.useClass);
  injector.addProvider(CliConfiguration, provider);

  return provider.instance as any;
}

function createLogger(injector: InjectorService): DILogger {
  const provider = GlobalProviders.get(Logger)!.clone();

  provider.instance = injector.invoke<Logger>(provider.useClass);
  injector.addProvider(Logger, provider);

  return provider.instance as any;
}

function createProjectPackageJson(injector: InjectorService): DILogger {
  const provider = GlobalProviders.get(ProjectPackageJson)!.clone();
  injector.addProvider(ProjectPackageJson, provider);

  provider.instance = injector.invoke<ProjectPackageJson>(provider);

  return provider.instance as any;
}

export function createInjector(settings: Partial<DIConfigurationOptions> = {}) {
  const injector = new InjectorService();
  injector.settings = createConfiguration(injector);
  injector.logger = createLogger(injector);

  createProjectPackageJson(injector);

  injector.settings.set(settings);

  /* istanbul ignore next */
  if (injector.settings.env === "test") {
    injector.logger.stop();
  }

  return injector;
}
