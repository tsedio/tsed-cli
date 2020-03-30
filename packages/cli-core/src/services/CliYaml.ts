import {Inject, Injectable} from "@tsed/di";
import * as Fs from "fs-extra";
import * as JsYaml from "js-yaml";
import {join} from "path";
import {ProjectPackageJson} from "./ProjectPackageJson";

@Injectable()
export class CliYaml {
  @Inject()
  projectPackageJson: ProjectPackageJson;

  async read(path: string) {
    const content = await Fs.readFile(join(this.projectPackageJson.dir, path), {encoding: "utf8"});

    return JsYaml.safeLoad(content);
  }

  async write(path: string, obj: any) {
    const content = JsYaml.safeDump(obj);

    return Fs.writeFile(join(this.projectPackageJson.dir, path), content, {encoding: "utf8"});
  }
}
