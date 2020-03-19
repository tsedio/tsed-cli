import {Type} from "@tsed/core";
import {ICommand} from "./ICommand";
import {IPackageJson} from "./IPackageJson";

export * from "./ICommand";
export * from "./ICommandParameters";
export * from "./ICommandMetadata";
export * from "./ICliDefaultOptions";
export * from "./IPackageJson";
export * from "./Tasks";

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
    pkg: IPackageJson;
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
