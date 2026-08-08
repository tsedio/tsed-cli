import {taskLogger} from "@tsed/cli-tasks";
import {injector, lazyInject} from "@tsed/di";

import {CliFs} from "../services/CliFs.js";
import {ProjectPackageJson} from "../services/ProjectPackageJson.js";

const all = (promises: any[]) => Promise.all(promises);

export async function loadPlugins() {
  const $inj = injector();
  const name = $inj.settings.get("name");
  const projectPackageJson = $inj.invoke<ProjectPackageJson>(ProjectPackageJson);
  const fs = $inj.invoke<CliFs>(CliFs);

  const promises = Object.keys(projectPackageJson.allDependencies)
    .filter((mod) => mod.startsWith(`@${name}/cli-plugin`) || mod.includes(`${name}-cli-plugin`))
    .map(async (mod) => {
      try {
        if ($inj.settings.get("loaded")) {
          taskLogger().info(`Try to load ${mod}`);
          await lazyInject(() => fs.importModule(mod, projectPackageJson.cwd));
        }

        taskLogger().info(`${mod} module loaded`);
      } catch (er) {
        taskLogger().warn(`Fail to load plugin ${mod} ${er.message}`);
      }
    });

  await all(promises);
}
