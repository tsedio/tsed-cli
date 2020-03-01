import {Type} from "@tsed/core";
import {ICommand} from "./interfaces/ICommand";
import {CliPackageJson} from "./services/CliPackageJson";

export * from "./Cli";
export * from "./interfaces/ICommand";
export * from "./interfaces/ICommandParameters";
export * from "./interfaces/IPackageJson";
export * from "./services/CliConfiguration";
export * from "./services/CliService";
export * from "./services/CliPackageJson";
export * from "./services/ProjectPackageJson";
export * from "./services/RenderService";
export * from "./decorators/command";

declare namespace TsED {
  interface Configuration {
    /**
     *
     */
    name: string;
    /**
     *
     */
    commands: Type<ICommand>[];
    /**
     *
     */
    pkg: CliPackageJson;
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
