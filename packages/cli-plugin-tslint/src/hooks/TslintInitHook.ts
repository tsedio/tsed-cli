import {InitCmdContext} from "@tsed/cli";
import {Inject, Injectable, OnExec, OnPostInstall, ProjectPackageJson, RootRendererService} from "@tsed/cli-core";
import {TEMPLATE_DIR} from "../utils/templateDir";

@Injectable()
export class TslintInitHook {
  @Inject()
  protected packageJson: ProjectPackageJson;

  @Inject()
  protected rootRenderer: RootRendererService;

  @OnExec("init")
  onExec(ctx: InitCmdContext) {
    if (!ctx.tslint) {
      return [];
    }
    this.addScripts(ctx);
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    return [
      {
        title: "Generate files for tslint",
        task: (ctx: any) => {
          return this.rootRenderer.renderAll(
            [
              "tslint.json.hbs",
              ctx.lintstaged && ".lintstagedrc.hbs",
              ctx.prettier && ".prettierignore.hbs",
              ctx.prettier && ".prettierrc.hbs"
            ],
            ctx,
            {
              templateDir: `${TEMPLATE_DIR}/init`
            }
          );
        }
      }
    ];
  }

  @OnPostInstall("init")
  onPostInstall(ctx: InitCmdContext) {
    if (!ctx.tslint) {
      return [];
    }

    return [
      {
        title: "Run eslint",
        task: () => {
          return this.packageJson.runScript("test:lint:fix", true);
        }
      }
    ];
  }

  addScripts(ctx: InitCmdContext) {
    this.packageJson.addScripts({
      "test:lint": "tslint --project tsconfig.json",
      "test:lint:fix": "tslint --project tsconfig.json --fix"
    });

    if (ctx.prettier) {
      this.packageJson.addScripts({
        prettier: "prettier '{src,test}/**/*.ts' --write"
      });
    }
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        tslint: "latest"
      },
      ctx
    );

    if (ctx.lintstaged) {
      this.packageJson.addDevDependencies(
        {
          husky: "latest",
          "lint-staged": "latest"
        },
        ctx
      );

      this.packageJson.add("husky", {
        hooks: {
          "pre-commit": "lint-staged",
          "post-commit": "git update-index --again"
        }
      });
    }

    if (ctx.prettier) {
      this.packageJson.addDevDependencies(
        {
          prettier: "latest"
        },
        ctx
      );
    }
  }
}
