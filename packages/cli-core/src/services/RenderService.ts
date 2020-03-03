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
    const content = await Consolidate.handlebars(join(this.templateDir, path), data);

    const outputFile = join(this.rootDir, this.srcDir, output);
    await Fs.ensureDir(dirname(outputFile));
    return Fs.writeFile(outputFile, content, {encoding: "utf8"});
  }

  createRenderer(templateDir: string) {
    const renderer = new RenderService();
    renderer.templateDir = templateDir;
    renderer.rootDir = this.rootDir;
    renderer.srcDir = this.srcDir;

    return renderer;
  }
}
