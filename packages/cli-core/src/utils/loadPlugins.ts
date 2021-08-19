import {GlobalProviders, InjectorService} from "@tsed/di";
import {CliFs} from "../services/CliFs";
import {ProjectPackageJson} from "../services/ProjectPackageJson";

const all = (promises: any[]) => Promise.all(promises);

export async function loadPlugins(injector: InjectorService) {
  const {
    name,
    project: {rootDir}
  } = injector.settings;

  const projectPackageJson = injector.invoke<ProjectPackageJson>(ProjectPackageJson);
  const fs = injector.invoke<CliFs>(CliFs);

  const promises = Object.keys(projectPackageJson.allDependencies)
    .filter((mod) => mod.startsWith(`@${name}/cli-plugin`) || mod.includes(`${name}-cli-plugin`))
    .map(async (mod) => {
      const {default: plugin} = await fs.importModule(mod, rootDir);

      if (!injector.has(plugin)) {
        const provider = GlobalProviders.get(plugin)?.clone();

        if (provider?.imports.length) {
          await all(
            provider.imports.map(async (token) => {
              injector.add(token, GlobalProviders.get(token)?.clone());

              if (injector.settings.loaded) {
                await injector.invoke(token);
              }
            })
          );
        }

        injector.add(plugin, provider);

        if (injector.settings.loaded) {
          await injector.invoke(plugin);
        }
      }
    });

  await all(promises);
}
