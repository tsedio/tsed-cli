import {IInitCmdContext} from "@tsed/cli";
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
  onExec(ctx: IInitCmdContext) {
    this.addScripts(ctx);
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

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

  addScripts(ctx: IInitCmdContext) {
    this.packageJson.addScripts({
      test: "yarn clean && yarn test:lint && yarn test:coverage",
      "test:unit": "cross-env NODE_ENV=test mocha",
      "test:coverage": "cross-env NODE_ENV=test nyc mocha"
    });
  }

  addDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        "@types/chai": "latest",
        "@types/chai-as-promised": "latest",
        "@types/mocha": "latest",
        "@types/sinon": "latest",
        "@types/sinon-chai": "latest",
        chai: "latest",
        "chai-as-promised": "latest",
        mocha: "latest",
        nyc: "latest",
        sinon: "latest",
        "sinon-chai": "latest",
        "tsconfig-paths": "latest"
      },
      ctx
    );
  }
}
