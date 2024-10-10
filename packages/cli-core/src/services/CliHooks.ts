import {Injectable, injector} from "@tsed/di";

@Injectable()
export class CliHooks {
  async emit(hookName: string, cmd: string, ...args: any[]) {
    const inj = injector();
    const providers = inj.getProviders();
    let results: any = [];

    for (const provider of providers) {
      if (provider.useClass) {
        const instance: any = inj.get(provider.token)!;

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
