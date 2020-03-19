import {nameOf} from "@tsed/core";
import {GlobalProviders, InjectorService} from "@tsed/di";
import {ProjectPackageJson} from "../services/ProjectPackageJson";
import {importModule} from "./importModule";

const all = (promises: any[]) => Promise.all(promises);

export async function loadPlugins(injector: InjectorService) {
  const {
    name,
    project: {root}
  } = injector.settings;

  const projectPackageJson = injector.invoke<ProjectPackageJson>(ProjectPackageJson);

  const promises = Object.keys(projectPackageJson.allDependencies)
    .filter(mod => mod.startsWith(`@${name}/cli-plugin`) || mod.startsWith(`${name}-cli-plugin`))
    .map(async mod => {
      const {default: plugin} = await importModule(mod, root);

      if (!injector.has(plugin)) {
        const provider = GlobalProviders.get(plugin)?.clone();

        if (provider?.imports.length) {
          await all(
            provider.imports.map(async token => {
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
