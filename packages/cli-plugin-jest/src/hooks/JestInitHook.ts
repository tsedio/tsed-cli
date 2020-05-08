import {InitCmdContext} from "@tsed/cli";
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
  onInitExec(ctx: InitCmdContext) {
    this.addScripts();
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    return [
      {
        title: "Generate files for mocha",
        task: (ctx: any) => {
          return this.rootRenderer.renderAll(["init/jest.config.js.hbs"], ctx, {
            templateDir: TEMPLATE_DIR
          });
        }
      },
      {
        title: "Generate scripts files for mocha",
        task: (ctx: any) => {
          return this.scriptsRenderer.renderAll(["init/setup.jest.js.hbs"], ctx, {
            templateDir: TEMPLATE_DIR,
            rootDir: join(this.scriptsRenderer.rootDir, "jest")
          });
        }
      }
    ];
  }

  addScripts() {
    this.packageJson.addScripts({
      test: "yarn test:lint && yarn test:coverage",
      "test:unit": "cross-env NODE_ENV=test jest",
      "test:coverage": "yarn test:unit"
    });
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        "@types/jest": "latest",
        jest: "latest",
        "ts-jest": "latest"
      },
      ctx
    );
  }
}
