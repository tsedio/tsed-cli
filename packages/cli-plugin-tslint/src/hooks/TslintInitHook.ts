import {IInitCmdContext} from "@tsed/cli";
import {Inject, Injectable, OnExec, ProjectPackageJson, RootRendererService} from "@tsed/cli-core";
import {TEMPLATE_DIR} from "../utils/templateDir";

@Injectable()
export class TslintInitHook {
  @Inject()
  protected packageJson: ProjectPackageJson;

  @Inject()
  protected rootRenderer: RootRendererService;

  @OnExec("init")
  onExec(ctx: IInitCmdContext) {
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
              "init/tslint.json.hbs",
              ctx.lintstaged && "init/.lintstagedrc.hbs",
              ctx.prettier && "init/.prettierignore.hbs",
              ctx.prettier && "init/.prettierrc.hbs"
            ],
            ctx,
            {
              templateDir: TEMPLATE_DIR
            }
          );
        }
      }
    ];
  }

  addScripts(ctx: IInitCmdContext) {
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

  addDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: IInitCmdContext) {
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
