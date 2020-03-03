import {Injectable} from "@tsed/di";
import {dirname, join} from "path";
import {ClassNamePipe} from "./ClassNamePipe";

@Injectable()
export class OutputFilePathPipe {
  constructor(private classNamePipe: ClassNamePipe) {}

  transform(options: {name: string; type: string}) {
    const dir = dirname(options.name);

    return join(`${options.type}s`, dir, this.classNamePipe.transform(options));
  }
}
