import {InitCmdContext} from "@tsed/cli";
import {Inject, Injectable, OnExec, ProjectPackageJson, RootRendererService} from "@tsed/cli-core";
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
              ".eslintrc.hbs",
              ctx.lintstaged && ".husky/_/.gitignore.hbs",
              ctx.lintstaged && ".husky/_/husky.sh.hbs",
              ctx.lintstaged && ".husky/.gitignore.hbs",
              ctx.lintstaged && ".husky/post-commit.hbs",
              ctx.lintstaged && ".husky/pre-commit.hbs",
              ctx.lintstaged && "lint-staged.config.js.hbs",
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

  addScripts(ctx: InitCmdContext) {
    this.packageJson.addScripts({
      "test:lint": "eslint '**/*.{ts,js}'",
      "test:lint:fix": "eslint '**/*.{ts,js}' --fix"
    });

    if (ctx.prettier) {
      this.packageJson.addScripts({
        prettier: "prettier '**/*.{ts,js,json,md,yml,yaml}' --write",
        prepare: "is-ci || husky install"
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
          "is-ci": "latest",
          husky: "latest",
          "lint-staged": "latest"
        },
        ctx
      );
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
