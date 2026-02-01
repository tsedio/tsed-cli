import type {TokenProvider} from "@tsed/di";

import type {CommandProvider} from "./CommandProvider.js";
import type {PackageJson} from "./PackageJson.js";

export * from "./CliDefaultOptions.js";
export * from "./CommandData.js";
export * from "./CommandMetadata.js";
export * from "./CommandOptions.js";
export * from "./CommandProvider.js";
export * from "./PackageJson.js";
export * from "./ProjectPreferences.js";
export type {Task} from "@tsed/cli-tasks";

declare global {
  namespace TsED {
    interface Configuration {
      /**
       * Load given commands
       */
      commands: TokenProvider<CommandProvider>[];
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
       * A function that return default projet settings set in fresh project.
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
      /**
       * Check version and node version before running a command
       */
      checkPrecondition?: boolean;
      /**
       * Display available update on terminal before running a command
       */
      updateNotifier?: boolean;
    }
  }
}
