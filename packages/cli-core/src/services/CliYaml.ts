import {Inject, Injectable} from "@tsed/di";
import JsYaml from "js-yaml";

import {CliFs} from "./CliFs";

@Injectable()
export class CliYaml {
  @Inject()
  protected fs: CliFs;

  async read(path: string) {
    const content = await this.fs.readFile(path, {encoding: "utf8"});

    return JsYaml.load(content);
  }

  write(path: string, obj: any) {
    const content = JsYaml.dump(obj);

    return this.fs.writeFile(path, content, {encoding: "utf8"});
  }
}
