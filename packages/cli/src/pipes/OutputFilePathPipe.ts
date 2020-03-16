import {Injectable} from "@tsed/cli-core";
import {dirname, join} from "path";
import {ClassNamePipe} from "./ClassNamePipe";

@Injectable()
export class OutputFilePathPipe {
  constructor(private classNamePipe: ClassNamePipe) {}

  transform(options: {name: string; type: string}) {
    const dir = dirname(options.name);

    if (options.type === "server") {
      return join(dir, this.classNamePipe.transform(options));
    }

    return join(`${options.type}s`, dir, this.classNamePipe.transform(options));
  }
}
