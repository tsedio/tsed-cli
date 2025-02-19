import {RootRendererService} from "@tsed/cli";
import {inject, Injectable, OnExec, ProjectPackageJson} from "@tsed/cli-core";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

@Injectable()
export class JestInitHook {
  protected packageJson = inject(ProjectPackageJson);
  protected rootRenderer = inject(RootRendererService);

  @OnExec("init")
  onInitExec() {
    return [
      {
        title: "Generate files for jest",
        task: (ctx: any) => {
          return this.rootRenderer.renderAll(["jest.config.ts.hbs"], ctx, {
            templateDir: `${TEMPLATE_DIR}/init`
          });
        }
      }
    ];
  }
}
