function generateAliasesResolver(aliases: Record<string, string>, options?: any) {
  return (specifier: any, parentModuleURL: any, defaultResolve: any) => {
    if (aliases[specifier]) {
      return defaultResolve(aliases[specifier], parentModuleURL);
    }

    return defaultResolve(specifier, parentModuleURL);
  };
}

let resolver: any = null;

export async function initialize(aliases: Record<string, string>) {
  // Receives data from `register`.
  // console.debug("Initializing alias hook with aliases", aliases);

  resolver = generateAliasesResolver(aliases);
}

export function resolve(specifier: any, context: any, nextResolve: any) {
  return resolver(specifier, context, nextResolve);
}
