import {GlobalProviders, InjectorService} from "@tsed/di";
// @ts-ignore
import {figures} from "listr2";
import chalk from "chalk";
import {CliFs} from "../services/CliFs";
import {ProjectPackageJson} from "../services/ProjectPackageJson";

const all = (promises: any[]) => Promise.all(promises);

export async function loadPlugins(injector: InjectorService) {
  const name = injector.settings.get("name");
  const rootDir = injector.settings.get("project.rootDir");

  const projectPackageJson = injector.invoke<ProjectPackageJson>(ProjectPackageJson);
  const fs = injector.invoke<CliFs>(CliFs);

  const promises = Object.keys(projectPackageJson.allDependencies)
    .filter((mod) => mod.startsWith(`@${name}/cli-plugin`) || mod.includes(`${name}-cli-plugin`))
    .map(async (mod) => {
      try {
        const {default: plugin} = await fs.importModule(mod, rootDir);

        if (!injector.has(plugin)) {
          const provider = GlobalProviders.get(plugin)?.clone();

          if (provider?.imports.length) {
            await all(
              provider.imports.map(async (token) => {
                injector.add(token, GlobalProviders.get(token)?.clone());

                if (injector.settings.get("loaded")) {
                  await injector.invoke(token);
                }
              })
            );
          }

          injector.add(plugin, provider);

          if (injector.settings.get("loaded")) {
            await injector.invoke(plugin);
          }
        }
        injector.logger.info(chalk.green(figures.tick), mod, "module loaded");
      } catch (er) {
        injector.logger.warn(chalk.red(figures.cross), "Fail to load plugin", mod);
      }
    });

  await all(promises);
}
