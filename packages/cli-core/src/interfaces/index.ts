import {Type} from "@tsed/core";

import {CommandProvider} from "./CommandProvider";
import {PackageJson} from "./PackageJson";

export * from "./CliDefaultOptions";
export * from "./CommandMetadata";
export * from "./CommandParameters";
export * from "./CommandProvider";
export * from "./PackageJson";
export * from "./ProjectPreferences";
export * from "./Tasks";

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
