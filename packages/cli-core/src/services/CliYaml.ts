import {inject, Injectable} from "@tsed/di";
import JsYaml from "js-yaml";

import {CliFs} from "./CliFs.js";

@Injectable()
export class CliYaml {
  protected fs = inject(CliFs);

  async read(path: string) {
    const content = await this.fs.readFile(path, {encoding: "utf8"});

    return JsYaml.load(content);
  }

  write(path: string, obj: any) {
    const content = JsYaml.dump(obj);

    return this.fs.writeFile(path, content, {encoding: "utf8"});
  }
}
