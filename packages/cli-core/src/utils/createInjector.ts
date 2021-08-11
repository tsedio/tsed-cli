import {DIConfigurationOptions, DILogger, GlobalProviders, InjectorService} from "@tsed/di";
import {Logger} from "@tsed/logger";
import {CliConfiguration} from "../services/CliConfiguration";
import {ProjectPackageJson} from "../services/ProjectPackageJson";

function createConfiguration(injector: InjectorService): CliConfiguration & TsED.Configuration {
  const provider = GlobalProviders.get(CliConfiguration)!.clone();

  provider.instance = injector.invoke<CliConfiguration>(provider.useClass);
  injector.addProvider(CliConfiguration, provider);

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
  injector.logger = new Logger(settings.name || "CLI");

  createProjectPackageJson(injector);

  injector.settings.set(settings);

  /* istanbul ignore next */
  if (injector.settings.env === "test") {
    injector.logger.stop();
  } else {
    /* istanbul ignore next */
    injector.logger.level = injector.settings.logger?.level || "error";
  }

  return injector;
}
