import {Inject, Injectable} from "@tsed/di";
import * as Fs from "fs-extra";
import * as JsYaml from "js-yaml";
import {join} from "path";
import {findUpFile} from "../utils/findUpFile";
import {ProjectPackageJson} from "./ProjectPackageJson";

@Injectable()
export class CliYaml {
  @Inject()
  projectPackageJson: ProjectPackageJson;

  async read(path: string) {
    const file = findUpFile(this.projectPackageJson.dir, path);

    if (file) {
      const content = await Fs.readFile(file, {encoding: "utf8"});

      return JsYaml.safeLoad(content);
    }

    return {};
  }

  async write(path: string, obj: any) {
    const content = JsYaml.safeDump(obj);

    const file = findUpFile(this.projectPackageJson.dir, path) || join(this.projectPackageJson.dir, path);

    return Fs.writeFile(file, content, {encoding: "utf8"});
  }
}
