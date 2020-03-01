import {GlobalProviders, Provider, TypedProvidersRegistry} from "@tsed/di";

export const PROVIDER_TYPE_COMMAND = "command";
/**
 *
 * @type {Registry<Provider<any>, IProvider<any>>}
 */
// tslint:disable-next-line: variable-name
export const CommandRegistry: TypedProvidersRegistry = GlobalProviders.createRegistry(PROVIDER_TYPE_COMMAND, Provider, {
  injectable: true
});

export const registerCommand = GlobalProviders.createRegisterFn(PROVIDER_TYPE_COMMAND);
