import {
  Inject,
  Injectable,
  OnExec,
  ProjectPackageJson,
  RootRendererService,
  ScriptsRendererService,
  SrcRendererService
} from "@tsed/cli-core";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

@Injectable()
export class VitestInitHook {
  @Inject()
  protected packageJson: ProjectPackageJson;

  @Inject()
  protected srcRenderer: SrcRendererService;

  @Inject()
  protected rootRenderer: RootRendererService;

  @Inject()
  protected scriptsRenderer: ScriptsRendererService;

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
