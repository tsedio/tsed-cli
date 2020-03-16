import {Injectable} from "@tsed/cli-core";
import {pascalCase} from "change-case";
import {basename} from "path";

@Injectable()
export class ClassNamePipe {
  transform(options: {name: string; type: string}) {
    const name = basename(options.name);
    const postfix = pascalCase(options.type);

    switch (options.type) {
      case "decorator":
        return pascalCase(name);
      default:
        return (pascalCase(name) + postfix).replace(postfix + postfix, postfix);
    }
  }
}
