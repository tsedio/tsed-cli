import {Inject, Injectable, InjectorService} from "@tsed/di";

@Injectable()
export class CliHooks {
  @Inject()
  injector: InjectorService;

  async emit(hookName: string, cmd: string, ...args: any[]) {
    const providers = this.injector.getProviders();
    let results: any = [];

    for (const provider of providers) {
      if (provider.useClass) {
        const instance: any = this.injector.get(provider.token)!;

        if (provider.store.has(hookName)) {
          const props = provider.store.get(hookName)[cmd];
          if (props) {
            for (const propertyKey of props) {
              results = results.concat(await instance[propertyKey](...args));
            }
          }
        }
      }
    }

    return results.filter((o: any) => o !== undefined);
  }
}
