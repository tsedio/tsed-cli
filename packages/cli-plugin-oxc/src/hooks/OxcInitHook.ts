import {type CliCommandHooks, type InitCmdContext, render, type RenderDataContext} from "@tsed/cli";
import {PackageManagersModule, ProjectPackageJson, type Task, taskLogger} from "@tsed/cli-core";
import {inject, injectable} from "@tsed/di";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

export class OxcInitHook implements CliCommandHooks {
  $alterRenderFiles(files: string[], data: RenderDataContext) {
    if (!data.oxlint) {
      return files;
    }

    return [
      ...files,
      ...[data.lintstaged && ".husky/_/husky.sh", data.lintstaged && ".husky/post-commit", data.lintstaged && ".husky/pre-commit"]
        .filter(Boolean)
        .map((path) => ({
          id: "/" + path,
          from: `${TEMPLATE_DIR}/init`
        }))
    ];
  }

  $alterPackageJson(packageJson: ProjectPackageJson, data: RenderDataContext) {
    taskLogger().info("Alter package.json dependencies by OXC plugin");

    packageJson.addScripts({
      "test:lint": "oxlint",
      "test:lint:fix": "oxlint --fix"
    });

    packageJson.addDevDependencies(
      {
        oxlint: "latest"
      },
      data
    );

    if (data.oxfmt) {
      packageJson.addScripts({
        "test:format": "oxfmt --check",
        "test:format:fix": "oxfmt"
      });
      packageJson.addDevDependencies(
        {
          oxfmt: "latest"
        },
        data
      );
    }

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

    return packageJson;
  }

  $alterInitSubTasks(tasks: Task[], data: InitCmdContext) {
    return [
      ...tasks,
      {
        title: "Add OXC configuration",
        task: () => render("oxc.config", data)
      },
      {
        title: "Add Oxfmt configuration",
        skip: !data.oxfmt,
        task: () => render("oxfmt.config", data)
      },
      {
        title: "Add lint-staged configuration",
        skip: !data.lintstaged,
        task: () => render("oxc.lintstagedrc", data)
      },
      {
        title: "Add husky gitignore file",
        skip: !data.lintstaged,
        task: () => render("oxc.huskyGitignore", {...data, symbolPath: ".husky/.gitignore"})
      },
      {
        title: "Add Husky internal gitignore file",
        skip: !data.lintstaged,
        task: () => render("oxc.huskyGitignore", {...data, symbolPath: ".husky/_/.gitignore"})
      }
    ];
  }

  $alterInitPostInstallTasks(tasks: Task[], data: InitCmdContext): Task[] {
    const packageJson = inject(ProjectPackageJson);
    const packageManagers = inject(PackageManagersModule);

    return [
      ...tasks,
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
        task: () => packageManagers.runScript("test:lint:fix", {ignoreError: true})
      }
    ];
  }
}

injectable(OxcInitHook);
