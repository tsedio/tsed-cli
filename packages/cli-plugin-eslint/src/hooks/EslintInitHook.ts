import {InitCmdContext} from "@tsed/cli";
import {Inject, Injectable, OnExec, OnPostInstall, ProjectPackageJson, RootRendererService} from "@tsed/cli-core";
import {TEMPLATE_DIR} from "../utils/templateDir";

@Injectable()
export class EslintInitHook {
  @Inject()
  protected packageJson: ProjectPackageJson;

  @Inject()
  protected rootRenderer: RootRendererService;

  @OnExec("init")
  onExec(ctx: InitCmdContext) {
    if (!ctx.eslint) {
      return [];
    }
    this.addScripts(ctx);
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    return [
      {
        title: "Generate files for eslint",
        task: (ctx: any) => {
          return this.rootRenderer.renderAll(
            [
              "init/.eslintrc.hbs",
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

  @OnPostInstall("init")
  onPostInstall(ctx: InitCmdContext) {
    if (!ctx.eslint) {
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
      "test:lint": "eslint src --ext .ts",
      "test:lint:fix": "eslint src --ext .ts --fix"
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
        eslint: "latest",
        "eslint-config-prettier": "latest",
        "eslint-plugin-prettier": "latest",
        "@typescript-eslint/parser": "latest",
        "@typescript-eslint/eslint-plugin": "latest"
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
