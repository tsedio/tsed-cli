import "@tsed/logger-std";
import "@tsed/logger-pattern-layout";

import {injector} from "@tsed/di";
import {Logger} from "@tsed/logger";

import {ProjectPackageJson} from "../services/ProjectPackageJson.js";

let logger: Logger;

declare global {
  namespace TsED {
    interface Configuration {
      logger?: LoggerConfiguration;
    }

    interface LoggerConfiguration {
      disableCliFormat?: boolean;
    }
  }
}

export function getLogger() {
  return logger;
}

export function createInjector(settings: Partial<TsED.Configuration> = {}) {
  const inj = injector();
  logger = inj.logger = new Logger(settings.name || "CLI");

  inj.addProvider(ProjectPackageJson);

  inj.settings.set({
    ...settings,
    project: {
      root: process.cwd(),
      srcDir: "src",
      ...(settings.project || {})
    }
  } as TsED.Configuration);

  /* istanbul ignore next */
  if (inj.settings.env === "test") {
    inj.logger.stop();
  } else {
    /* istanbul ignore next */
    if (!settings.logger?.disableCliFormat) {
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
  }

  return inj;
}
