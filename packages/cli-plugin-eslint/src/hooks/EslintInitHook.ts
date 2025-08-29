import {type CliCommandHooks, type InitCmdContext, render, type RenderDataContext, type RenderOptions} from "@tsed/cli";
import {PackageManagersModule, ProjectPackageJson, type Task} from "@tsed/cli-core";
import {inject, injectable} from "@tsed/di";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

export class EslintInitHook implements CliCommandHooks {
  $alterRenderFiles(
    files: (string | RenderOptions)[],
    data: RenderDataContext
  ): (string | RenderOptions)[] | Promise<(string | RenderOptions)[]> {
    if (!data.eslint) {
      return files;
    }

    return [
      ...files,
      ...[
        data.lintstaged && ".husky/_/.gitignore",
        data.lintstaged && ".husky/_/husky.sh",
        data.lintstaged && ".husky/.gitignore",
        data.lintstaged && ".husky/post-commit",
        data.lintstaged && ".husky/pre-commit",
        data.lintstaged && ".lintstagedrc.json",
        data.prettier && ".prettierignore",
        data.prettier && ".prettierrc"
      ]
        .filter(Boolean)
        .map((path) => {
          return {
            path,
            templateDir: `${TEMPLATE_DIR}/init`
          };
        })
    ] as (string | RenderOptions)[];
  }

  $alterPackageJson(packageJson: ProjectPackageJson, data: RenderDataContext): ProjectPackageJson | Promise<ProjectPackageJson> {
    packageJson.addScripts({
      "test:lint": "eslint",
      "test:lint:fix": "eslint --fix"
    });

    if (data.prettier) {
      packageJson.addScripts({
        prettier: "prettier '**/*.{json,md,yml,yaml}' --write"
      });
    }

    packageJson.addDevDependencies(
      {
        "@typescript-eslint/parser": "latest",
        "@typescript-eslint/eslint-plugin": "latest",
        eslint: "latest",
        "eslint-config-prettier": "latest",
        "eslint-plugin-prettier": "latest",
        "eslint-plugin-simple-import-sort": "latest",
        globals: "latest"
      },
      data
    );

    if (data.lintstaged) {
      packageJson.addDevDependencies(
        {
          "is-ci": "latest",
          husky: "latest",
          "lint-staged": "latest"
        },
        data
      );
    }

    if (data.vitest) {
      packageJson.addDevDependencies(
        {
          "eslint-plugin-vitest": "latest"
        },
        data
      );
    }

    if (data.prettier) {
      packageJson.addDevDependencies(
        {
          prettier: "latest"
        },
        data
      );
    }

    return packageJson;
  }

  $alterInitPostInstallTasks(tasks: Task[], data: InitCmdContext): Task[] | Promise<Task[]> {
    const packageJson = inject(ProjectPackageJson);
    const packageManagers = inject(PackageManagersModule);

    return [
      ...tasks,
      {
        title: "Add eslint configuration",
        task: () => {
          render("eslint.config", {
            ...data,
            name: "eslint.config"
          });
        }
      },
      {
        title: "Add husky prepare task",
        skip: !data.lintstaged,
        task: async () => {
          packageJson
            .refresh()
            .addScripts({
              prepare: "is-ci || husky install"
            })
            .write();

          return packageManagers.runScript("prepare", {
            ignoreError: true
          });
        }
      },
      {
        title: "Run linter",
        task: () => {
          return packageManagers.runScript("test:lint:fix", {
            ignoreError: true
          });
        }
      }
    ];
  }
}

injectable(EslintInitHook);
