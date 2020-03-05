import {GlobalProviderRegistry, GlobalProviders, InjectorService, Provider} from "@tsed/di";
import {ProjectPackageJson} from "../services/ProjectPackageJson";
import {importModule} from "./importModule";

export async function loadPlugins(injector: InjectorService) {
  const {
    scope = "tsed",
    project: {root}
  } = injector.settings;
  const projectPackageJson = injector.invoke<ProjectPackageJson>(ProjectPackageJson);

  const localDi = await importModule("@tsed/di", root);
  const localGlobalProviders = localDi.GlobalProviders as GlobalProviderRegistry;

  const add = (token: Provider<any>) => injector.add(token, localGlobalProviders.get(token)?.clone());
  const promises = Object.keys(projectPackageJson.allDependencies)
    .filter(mod => mod.startsWith(`@${scope}/cli-plugin`) || mod.startsWith(`${scope}-cli-plugin`))
    .map(async mod => {
      const {default: plugin} = await importModule(mod, root);

      if (!GlobalProviders.has(plugin) && localGlobalProviders.has(plugin)) {
        const provider = localGlobalProviders.get(plugin)?.clone();

        if (provider?.imports.length) {
          provider?.imports.forEach(add);
        }
        add(plugin);
      }
    });

  return Promise.all(promises);
}
