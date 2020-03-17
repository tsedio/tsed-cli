import {constructorOf, Type} from "@tsed/core";
import {Container, GlobalProviders, InjectorService, LocalsContainer} from "@tsed/di";

function createContainer(rootModule?: any) {
  const container = new Container(GlobalProviders.entries());

  if (rootModule) {
    container.delete(constructorOf(rootModule));
  }

  return container;
}

export async function loadInjector(
  injector: InjectorService,
  rootModule: Type<any>,
  container: Container = createContainer()
): Promise<LocalsContainer<any>> {
  // Clone all providers in the container
  injector.addProviders(container);

  // Resolve all configuration
  injector.resolveConfiguration();

  injector.settings.forEach((value, key) => {
    injector.logger.debug(`settings.${key} =>`, value);
  });

  // Invoke root module
  injector.invoke(rootModule);

  injector.settings.loaded = true;

  return injector.load(container);
}
