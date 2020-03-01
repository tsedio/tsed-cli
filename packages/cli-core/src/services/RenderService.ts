import {Constant, Injectable} from "@tsed/di";
import * as Consolidate from "consolidate";
import * as Fs from "fs-extra";
import {dirname, join} from "path";

@Injectable()
export class RenderService {
  @Constant("templateDir")
  templateDir: string = "";

  @Constant("project.root")
  rootDir: string = "";

  @Constant("project.srcDir")
  srcDir: string = "";

  async render(path: string, data: any, output: string) {
    path = join(this.templateDir, path);

    const content = await Consolidate.handlebars(path, data);

    const outputFile = join(this.rootDir, this.srcDir, output);
    await Fs.ensureDir(dirname(outputFile));
    return Fs.writeFile(outputFile, content, {encoding: "utf8"});
  }
}
