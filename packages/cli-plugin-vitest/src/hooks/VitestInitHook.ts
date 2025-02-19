import {RootRendererService} from "@tsed/cli";
import {inject, Injectable, OnExec, ProjectPackageJson} from "@tsed/cli-core";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

@Injectable()
export class VitestInitHook {
  protected packageJson = inject(ProjectPackageJson);
  protected rootRenderer = inject(RootRendererService);

  @OnExec("init")
  onInitExec() {
    return [
      {
        title: "Generate files for vitest",
        task: (ctx: any) => {
          return this.rootRenderer.renderAll(["vitest.config.mts.hbs"], ctx, {
            templateDir: `${TEMPLATE_DIR}/init`
          });
        }
      }
    ];
  }
}
