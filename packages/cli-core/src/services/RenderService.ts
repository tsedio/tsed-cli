import {Constant, Injectable} from "@tsed/di";
import * as Consolidate from "consolidate";
import * as Fs from "fs-extra";
import {basename, dirname, join} from "path";
import {Observable} from "rxjs";

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

    const outputFile = join(...[this.rootDir, this.srcDir, output].filter(Boolean));

    await Fs.ensureDir(dirname(outputFile));

    return Fs.writeFile(outputFile, content, {encoding: "utf8"});
  }

  async renderAll(paths: string[], data: any) {
    let count = 0;

    return new Observable(observer => {
      observer.next(`[${count}/${paths.length}] Rendering files...`);

      const promises = paths.map(async path => {
        const output = basename(path).replace(/\.hbs$/, "");

        await this.render(path, data, output);

        count++;
        observer.next(`[${count}/${paths.length}] Rendering files...`);
      });

      Promise.all(promises).then(() => {
        observer.next(`[${count}/${paths.length}] Rendering files...`);
        observer.complete();
      });
    });
  }

  createRenderer(templateDir: string) {
    const renderer = new RenderService();
    renderer.templateDir = templateDir;
    renderer.rootDir = this.rootDir;
    renderer.srcDir = this.srcDir;

    return renderer;
  }

  clone(options: Partial<{templateDir: string; rootDir: string; srcDir: string}> = {}) {
    const renderer = new RenderService();
    const {templateDir = this.templateDir, rootDir = this.rootDir, srcDir = this.srcDir} = options;

    renderer.templateDir = templateDir;
    renderer.rootDir = rootDir;
    renderer.srcDir = srcDir;

    return renderer;
  }

  templateExists(path: string) {
    return Fs.existsSync(join(this.templateDir, path));
  }
}
