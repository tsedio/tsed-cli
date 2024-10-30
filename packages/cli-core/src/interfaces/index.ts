import {Type} from "@tsed/core";

import type {CommandProvider} from "./CommandProvider.js";
import type {PackageJson} from "./PackageJson.js";

export * from "./CliDefaultOptions.js";
export * from "./CommandMetadata.js";
export * from "./CommandParameters.js";
export * from "./CommandProvider.js";
export * from "./PackageJson.js";
export * from "./ProjectPreferences.js";
export * from "./Tasks.js";

declare global {
  namespace TsED {
    interface Configuration {
      /**
       * Load given commands
       */
      commands: Type<CommandProvider>[];
      /**
       * Init Cli with defined argv
       */
      argv?: string[];
      /**
       * The CLI name
       */
      name: string;
      /**
       * The CLI package.json
       */
      pkg?: PackageJson;
      /**
       *
       */
      templateDir?: string;
      /**
       *
       * @param pkg
       */
      defaultProjectPreferences?: (pkg?: any) => Record<string, any>;
      /**
       * Project initial settings.
       */
      project: {
        rootDir?: string;
        srcDir?: string;
        scriptsDir?: string;
        reinstallAfterRun?: boolean;
      };
      /**
       * Enable plugins loading
       */
      plugins: boolean;
    }
  }
}
