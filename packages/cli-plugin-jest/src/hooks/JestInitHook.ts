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
export class JestInitHook {
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
        title: "Generate files for jest",
        task: (ctx: any) => {
          return this.rootRenderer.renderAll(["init/jest.config.js.hbs"], ctx, {
            templateDir: TEMPLATE_DIR
          });
        }
      },
      {
        title: "Generate scripts files for jest",
        task: (ctx: any) => {
          return this.scriptsRenderer.renderAll(["init/setup.jest.js.hbs"], ctx, {
            templateDir: TEMPLATE_DIR,
            rootDir: join(this.scriptsRenderer.rootDir, "jest")
          });
        }
      }
    ];
  }
}
