import {injector, lazyInject, logger} from "@tsed/di";
import chalk from "chalk";
import figures from "figures";

import {CliFs} from "../services/CliFs.js";
import {ProjectPackageJson} from "../services/ProjectPackageJson.js";

const all = (promises: any[]) => Promise.all(promises);

export async function loadPlugins() {
  const $inj = injector();
  const name = $inj.settings.get("name");
  const rootDir = $inj.settings.get("project.rootDir");

  const projectPackageJson = $inj.invoke<ProjectPackageJson>(ProjectPackageJson);
  const fs = $inj.invoke<CliFs>(CliFs);

  const promises = Object.keys(projectPackageJson.allDependencies)
    .filter((mod) => mod.startsWith(`@${name}/cli-plugin`) || mod.includes(`${name}-cli-plugin`))
    .map(async (mod) => {
      try {
        if ($inj.settings.get("loaded")) {
          logger().info("Try to load ", mod);
          await lazyInject(() => fs.importModule(mod, rootDir));
        }

        // if (!$inj.has(plugin)) {
        //   const provider = GlobalProviders.get(plugin)?.clone();
        //
        //   if (provider?.imports.length) {
        //     await all(
        //       provider.imports.map(async (token: any) => {
        //         $inj.add(token, GlobalProviders.get(token)?.clone());
        //
        //         if ($inj.settings.get("loaded")) {
        //           await $inj.invoke(token);
        //         }
        //       })
        //     );
        //   }
        //
        //   $inj.add(plugin, provider);
        //
        //   if ($inj.settings.get("loaded")) {
        //     await $inj.invoke(plugin);
        //   }
        // }
        logger().info(chalk.green(figures.tick), mod, "module loaded");
      } catch (er) {
        logger().warn(chalk.red(figures.cross), "Fail to load plugin", mod);
      }
    });

  await all(promises);
}
