import {type DIConfigurationOptions, injector, InjectorService} from "@tsed/di";
import {Logger} from "@tsed/logger";

import {CliConfiguration} from "../services/CliConfiguration.js";
import {ProjectPackageJson} from "../services/ProjectPackageJson.js";

let logger: Logger;

export function getLogger() {
  return logger;
}

function createConfiguration(injector: InjectorService): CliConfiguration & TsED.Configuration {
  injector.addProvider(CliConfiguration);

  return injector.invoke<CliConfiguration & TsED.Configuration>(CliConfiguration);
}

export function createInjector(settings: Partial<DIConfigurationOptions> = {}) {
  const inj = injector();
  inj.settings = createConfiguration(inj);
  logger = inj.logger = new Logger(settings.name || "CLI");

  inj.addProvider(ProjectPackageJson);

  inj.settings.set(settings);

  /* istanbul ignore next */
  if (inj.settings.env === "test") {
    inj.logger.stop();
  } else {
    /* istanbul ignore next */
    inj.logger.level = inj.settings.logger?.level || "warn";
    inj.logger.appenders
      .set("stdout", {
        type: "stdout",
        layout: {
          type: "pattern",
          pattern: "[%d{hh:mm:ss}] %m"
        },
        levels: ["info", "debug"]
      })
      .set("stderr", {
        type: "stderr",
        layout: {
          type: "pattern",
          pattern: "[%d{hh:mm:ss}][%p] %m"
        },
        levels: ["trace", "fatal", "error", "warn"]
      });
  }

  return inj;
}
