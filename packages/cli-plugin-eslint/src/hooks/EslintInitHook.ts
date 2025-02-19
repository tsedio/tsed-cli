import {type InitCmdContext, RootRendererService} from "@tsed/cli";
import {inject, Injectable, OnExec, OnPostInstall, PackageManagersModule, ProjectPackageJson} from "@tsed/cli-core";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

@Injectable()
export class EslintInitHook {
  protected packageJson = inject(ProjectPackageJson);
  protected packageManagers = inject(PackageManagersModule);
  protected rootRenderer = inject(RootRendererService);

  @OnExec("init")
  onExec(ctx: InitCmdContext) {
    if (!ctx.eslint) {
      return [];
    }

    return [
      {
        title: "Generate files for eslint",
        task: (ctx: any) => {
          return this.rootRenderer.renderAll(
            [
              "eslint.config.mjs.hbs",
              ctx.lintstaged && ".husky/_/.gitignore.hbs",
              ctx.lintstaged && ".husky/_/husky.sh.hbs",
              ctx.lintstaged && ".husky/.gitignore.hbs",
              ctx.lintstaged && ".husky/post-commit.hbs",
              ctx.lintstaged && ".husky/pre-commit.hbs",
              ctx.lintstaged && ".lintstagedrc.json.hbs",
              ctx.prettier && ".prettierignore.hbs",
              ctx.prettier && ".prettierrc.hbs"
            ],
            ctx,
            {
              templateDir: `${TEMPLATE_DIR}/init`
            }
          );
        }
      },
      {
        title: "Add dependencies",
        task: () => {
          this.addScripts(ctx);
          this.addDependencies(ctx);
          this.addDevDependencies(ctx);
        }
      }
    ];
  }

  @OnPostInstall("init")
  onPostInstall(ctx: InitCmdContext) {
    return [
      {
        title: "Add husky prepare task",
        skip: !ctx.lintstaged,
        task: async () => {
          this.packageJson
            .refresh()
            .addScripts({
              prepare: "is-ci || husky install"
            })
            .write();

          await this.packageManagers.runScript("prepare");
        }
      },
      {
        title: "Run linter",
        task: () => {
          return this.packageManagers.runScript("test:lint:fix", {
            ignoreError: true
          });
        }
      }
    ];
  }

  addScripts(ctx: InitCmdContext) {
    this.packageJson.addScripts({
      "test:lint": "eslint",
      "test:lint:fix": "eslint --fix"
    });

    if (ctx.prettier) {
      this.packageJson.addScripts({
        prettier: "prettier '**/*.{json,md,yml,yaml}' --write"
      });
    }
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        "@typescript-eslint/parser": "latest",
        "@typescript-eslint/eslint-plugin": "latest",
        eslint: "latest",
        "eslint-config-prettier": "latest",
        "eslint-plugin-prettier": "latest",
        "eslint-plugin-simple-import-sort": "latest",
        globals: "latest"
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

    if (ctx.vitest) {
      this.packageJson.addDevDependencies(
        {
          "eslint-plugin-vitest": "latest"
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
