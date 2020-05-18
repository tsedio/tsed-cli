import {
  Inject,
  Injectable,
  OnExec,
  ProjectPackageJson,
  RootRendererService,
  ScriptsRendererService,
  SrcRendererService
} from "@tsed/cli-core";
import {join} from "path";
import {TEMPLATE_DIR} from "../utils/templateDir";

@Injectable()
export class MochaInitHook {
  @Inject()
  protected packageJson: ProjectPackageJson;

  @Inject()
  protected srcRenderer: SrcRendererService;

  @Inject()
  protected rootRenderer: RootRendererService;

  @Inject()
  protected scriptsRenderer: ScriptsRendererService;

  @OnExec("init")
  onExec() {
    return [
      {
        title: "Generate files for mocha",
        task: (ctx: any) => {
          return this.rootRenderer.renderAll(["init/.mocharc.js.hbs", "init/.nycrc.hbs"], ctx, {
            templateDir: TEMPLATE_DIR
          });
        }
      },
      {
        title: "Generate scripts files for mocha",
        task: (ctx: any) => {
          return this.scriptsRenderer.renderAll(["init/register.js.hbs"], ctx, {
            templateDir: TEMPLATE_DIR,
            rootDir: join(this.scriptsRenderer.rootDir, "mocha")
          });
        }
      }
    ];
  }
}
