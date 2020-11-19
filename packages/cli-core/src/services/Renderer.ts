import {Configuration, Constant, Inject, Injectable} from "@tsed/di";
import * as Consolidate from "consolidate";
import * as Fs from "fs-extra";
import * as globby from "globby";
import {basename, dirname, join, relative} from "path";
import {Observable} from "rxjs";
import {CliFs} from "./CliFs";

const normalizePath = require("normalize-path");

require("handlebars-helpers")({
  handlebars: require("handlebars")
});

export interface RenderOptions {
  templateDir?: string;
  rootDir?: string;
  output?: string;
}

export abstract class Renderer {
  @Constant("templateDir")
  templateDir: string;

  @Inject()
  fs: CliFs;

  abstract get rootDir(): string;

  async render(path: string, data: any, options: RenderOptions = {}) {
    const {output, templateDir, rootDir} = this.mapOptions(path, options);
    const content = await Consolidate.handlebars(join(templateDir, path), data);

    return this.write(content, {output, rootDir});
  }

  async renderAll(paths: string[], data: any, options: RenderOptions = {}) {
    let count = 0;

    return new Observable((observer) => {
      observer.next(`[${count}/${paths.length}] Rendering files...`);

      const promises = paths.filter(Boolean).map(async (path) => {
        await this.render(path, data, options);

        count++;
        observer.next(`[${count}/${paths.length}] Rendering files...`);
      });

      Promise.all(promises)
        .then(() => {
          observer.next(`[${count}/${paths.length}] Rendering files...`);
          observer.complete();
        })
        .catch((err) => {
          observer.error(err);
        });
    });
  }

  async write(content: string, options: any) {
    const {output, rootDir = this.rootDir} = options;
    const outputFile = join(...[rootDir, output].filter(Boolean));

    await this.fs.ensureDir(dirname(outputFile));

    return this.fs.writeFile(outputFile, content, {encoding: "utf8"});
  }

  templateExists(path: string, options: RenderOptions = {}) {
    const {templateDir} = this.mapOptions(path, options);

    return Fs.existsSync(join(templateDir, path));
  }

  scan(pattern: string[], options: any = {}) {
    return globby(
      pattern.map((s: string) => normalizePath(s)),
      {
        ...options,
        cwd: this.rootDir
      }
    );
  }

  relativeFrom(path: string) {
    return relative(dirname(join(this.rootDir, path)), this.rootDir);
  }

  protected mapOptions(path: string, options: RenderOptions) {
    const {output = basename(path).replace(/\.hbs$/, ""), templateDir = this.templateDir, rootDir = this.rootDir} = options;
    return {output, templateDir, rootDir};
  }
}

@Injectable()
export class RootRendererService extends Renderer {
  @Constant("templateDir")
  templateDir: string;

  @Configuration()
  private configuration: Configuration;

  get rootDir() {
    return this.configuration.project?.rootDir as string;
  }
}

@Injectable()
export class SrcRendererService extends Renderer {
  @Constant("templateDir")
  templateDir: string;

  @Configuration()
  private configuration: Configuration;

  get rootDir() {
    return join(...([this.configuration.project?.rootDir, this.configuration.project?.srcDir].filter(Boolean) as string[]));
  }
}

@Injectable()
export class ScriptsRendererService extends Renderer {
  @Constant("templateDir")
  templateDir: string;

  @Configuration()
  private configuration: Configuration;

  get rootDir() {
    return join(...([this.configuration.project?.rootDir, this.configuration.project?.scriptsDir].filter(Boolean) as string[]));
  }
}
