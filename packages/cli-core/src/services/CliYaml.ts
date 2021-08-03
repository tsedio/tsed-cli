import {Inject, Injectable} from "@tsed/di";
import JsYaml from "js-yaml";
import {join} from "path";
import {CliFs} from "./CliFs";
import {ProjectPackageJson} from "./ProjectPackageJson";

@Injectable()
export class CliYaml {
  @Inject()
  protected projectPackageJson: ProjectPackageJson;

  @Inject()
  protected fs: CliFs;

  async read(path: string) {
    const file = !this.fs.exists(path) ? this.fs.findUpFile(this.projectPackageJson.dir, path) : path;

    if (file) {
      const content = await this.fs.readFile(file, {encoding: "utf8"});

      return JsYaml.load(content);
    }

    return {};
  }

  async write(path: string, obj: any) {
    const content = JsYaml.dump(obj);

    const file = this.fs.findUpFile(this.projectPackageJson.dir, path) || join(this.projectPackageJson.dir, path);

    return this.fs.writeFile(file, content, {encoding: "utf8"});
  }
}
