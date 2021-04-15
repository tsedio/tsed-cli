import {Configuration, Constant, Inject, Injectable} from "@tsed/di";
import * as Consolidate from "consolidate";
import * as Fs from "fs-extra";
import * as globby from "globby";
import {dirname, join, relative} from "path";
import {Observable} from "rxjs";
import {CliFs} from "./CliFs";
import "../utils/hbs";
import {isString} from "@tsed/core";
import {insertImport} from "../utils/renderer/insertImport";
import {insertAfter} from "../utils/renderer/insertAfter";

const normalizePath = require("normalize-path");

export interface RenderOptions {
  path: string;
  templateDir: string;
  rootDir: string;
  output: string;
  baseDir: string;
  basename: string;
}

export abstract class Renderer {
  @Constant("templateDir")
  templateDir: string;

  @Inject()
  fs: CliFs;

  abstract get rootDir(): string;

  async render(path: string, data: any, options: Partial<RenderOptions> = {}) {
    const {output, templateDir, rootDir} = this.mapOptions(path, options);

    const content = await Consolidate.handlebars(normalizePath(join(templateDir, path)), data);

    return this.write(content, {output, rootDir});
  }

  async renderAll(paths: (string | RenderOptions)[], data: any, options: Partial<RenderOptions> = {}) {
    let count = 0;

    const mapOptions = (opts: string | RenderOptions): Partial<RenderOptions> & {path: string} => {
      if (isString(opts)) {
        return {...options, path: opts};
      }

      return {
        ...options,
        ...opts
      };
    };

    return new Observable((observer) => {
      observer.next(`[${count}/${paths.length}] Rendering files...`);

      const promises = paths
        .filter(Boolean)
        .map(mapOptions)
        .map(async ({path, ...opts}) => {
          await this.render(path, data, opts);

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

  templateExists(path: string, options: Partial<RenderOptions> = {}) {
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

  async update(path: string, actions: {type?: string; content: string; pattern?: RegExp}[]) {
    path = join(this.rootDir, path);
    if (!this.fs.exists(path)) {
      return;
    }

    const content: string = actions.reduce((fileContent, action) => {
      switch (action.type) {
        case "import":
          return insertImport(fileContent, action.content);
        case "insert-after":
          return insertAfter(fileContent, action.content, action.pattern!);
        default:
          break;
      }

      return fileContent;
    }, await this.fs.readFile(path, {encoding: "utf8"}));

    return this.fs.writeFile(path, content, {encoding: "utf8"});
  }

  protected mapOptions(path: string, options: Partial<RenderOptions>) {
    const {templateDir = this.templateDir, rootDir = this.rootDir} = options;
    let {output = path} = options;

    if (options.baseDir) {
      output = normalizePath(join("/", relative(options.baseDir, path)));
    }

    if (options.basename) {
      output = normalizePath(join(dirname(output), options.basename));
    }

    output = output.replace(/\.hbs$/, "");

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
