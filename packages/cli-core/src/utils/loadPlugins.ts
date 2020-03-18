import {GlobalProviders, InjectorService} from "@tsed/di";
import {ProjectPackageJson} from "../services/ProjectPackageJson";
import {importModule} from "./importModule";

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
          provider.imports.forEach(token => injector.add(token, provider));
        }

        injector.add(plugin, provider);

        if (injector.settings.loaded) {
          await injector.invoke(plugin);
        }
      }
    });

  await Promise.all(promises);
}
