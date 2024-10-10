import {inject, Injectable, ProjectPackageJson, SrcRendererService} from "@tsed/cli-core";
import {camelCase, constantCase, kebabCase} from "change-case";
import {basename, join} from "path";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

@Injectable()
export class CliMongoose {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected srcRenderer = inject(SrcRendererService);

  async writeConfig(name: string, options: any = {}) {
    await this.srcRenderer.render(
      "config.hbs",
      {
        ...options,
        symbolName: constantCase(name),
        name: kebabCase(name)
      },
      {
        output: `${kebabCase(name)}.config.ts`,
        rootDir: join(this.srcRenderer.rootDir, "config", "mongoose"),
        templateDir: TEMPLATE_DIR
      }
    );

    return this.regenerateIndexConfig();
  }

  async regenerateIndexConfig() {
    const list = await this.srcRenderer.scan(["config/mongoose/*.config.ts"]);

    const configs = list.map((file) => {
      const name = basename(file).replace(/\.config\.ts/gi, "");

      return {
        name,
        symbolName: camelCase(name)
      };
    });

    return this.srcRenderer.render(
      "index.hbs",
      {
        configs
      },
      {
        templateDir: TEMPLATE_DIR,
        output: "index.ts",
        rootDir: join(this.srcRenderer.rootDir, "config", "mongoose")
      }
    );
  }
}
