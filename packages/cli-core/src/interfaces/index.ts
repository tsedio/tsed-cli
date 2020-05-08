import {Type} from "@tsed/core";
import {CommandProvider} from "./CommandProvider";
import {PackageJson} from "./PackageJson";

export * from "./CommandProvider";
export * from "./CommandParameters";
export * from "./CommandMetadata";
export * from "./CliDefaultOptions";
export * from "./PackageJson";
export * from "./Tasks";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace TsED {
  interface Configuration {
    /**
     *
     */
    name: string;
    /**
     *
     */
    commands: Type<CommandProvider>[];
    /**
     *
     */
    pkg: PackageJson;
    /**
     *
     */
    templateDir: string;
    /**
     *
     */
    project?: {
      root?: string;
      srcDir?: string;
    };
  }
}
