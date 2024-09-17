import "../utils/hbs/index.js";

import {isString} from "@tsed/core";
import {Configuration, Constant, Inject, Injectable} from "@tsed/di";
import Consolidate from "consolidate";
import fs from "fs-extra";
import globby from "globby";
import handlebars from "handlebars";
import normalizePath from "normalize-path";
import {basename, dirname, join, relative} from "path";
import {Observable} from "rxjs";

import {insertAfter} from "../utils/renderer/insertAfter.js";
import {insertImport} from "../utils/renderer/insertImport.js";
import {CliFs} from "./CliFs.js";

export interface RenderOptions {
  path: string;
  templateDir: string;
  rootDir: string;
  output: string;
  baseDir: string;
  basename: string;
  replaces?: string[];
}

export abstract class Renderer {
  @Constant("templateDir")
  templateDir: string;

  @Inject()
  fs: CliFs;
  cache = new Set<string>();

  @Configuration()
  protected configuration: Configuration;

  abstract get rootDir(): string;

  async loadPartials(cwd: string) {
    if (this.cache.has(cwd)) {
      return;
    }

    const files = await globby("**/_partials/*.hbs", {
      cwd
    });

    files.forEach((filename) => {
      let template = this.fs.readFileSync(join(cwd, filename), "utf8");
      const name = basename(filename).replace(".hbs", "");

      handlebars.registerPartial(name, template);
    });

    this.cache.add(cwd);
  }

  async render(path: string, data: any, options: Partial<RenderOptions> = {}) {
    const {output, templateDir, rootDir} = this.mapOptions(path, options);
    let content = "";

    const file = normalizePath(join(templateDir, path));

    options.baseDir && (await this.loadPartials(join(templateDir, options.baseDir)));

    if (path.endsWith(".hbs")) {
      content = await Consolidate.handlebars(file, data);
    } else {
      content = await this.fs.readFile(file, {encoding: "utf8"});
    }

    return this.write(content, {output, rootDir});
  }

  renderAll(paths: (string | RenderOptions)[], data: any, options: Partial<RenderOptions> = {}) {
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

    return fs.existsSync(join(templateDir, path));
  }

  async scan(pattern: string[], options: any = {}): Promise<string[]> {
    const result = await globby(
      pattern.map((s: string) => normalizePath(s)),
      {
        ...options,
        objectMode: true,
        cwd: this.rootDir
      }
    );

    return result.map((entry) => entry.path);
  }

  relativeFrom(path: string) {
    return relative(dirname(join(this.rootDir, path)), this.rootDir);
  }

  async update(path: string, actions: {type?: string; content: string; pattern?: RegExp}[]) {
    path = join(this.rootDir, path);
    if (!this.fs.exists(path)) {
      return;
    }

    const content: string = actions.reduce(
      (fileContent, action) => {
        switch (action.type) {
          case "import":
            return insertImport(fileContent, action.content);
          case "insert-after":
            return insertAfter(fileContent, action.content, action.pattern!);
          default:
            break;
        }

        return fileContent;
      },
      await this.fs.readFile(path, {encoding: "utf8"})
    );

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

    if (options.replaces) {
      options.replaces.filter(Boolean).forEach((replace) => {
        output = output.replace(replace, "");
      });
    }

    return {output, templateDir, rootDir};
  }
}

@Injectable()
export class RootRendererService extends Renderer {
  get rootDir() {
    return this.configuration.project?.rootDir as string;
  }
}

@Injectable()
export class SrcRendererService extends Renderer {
  get rootDir() {
    return join(...([this.configuration.project?.rootDir, this.configuration.project?.srcDir].filter(Boolean) as string[]));
  }
}

@Injectable()
export class ScriptsRendererService extends Renderer {
  get rootDir() {
    return join(...([this.configuration.project?.rootDir, this.configuration.project?.scriptsDir].filter(Boolean) as string[]));
  }
}
