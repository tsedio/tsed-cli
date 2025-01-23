import generateAliasesResolver from "esm-module-alias";

let resolver: any = null;

export async function initialize(aliases: Record<string, string>) {
  // Receives data from `register`.
  console.debug("Initializing alias hook with aliases", aliases);

  resolver = generateAliasesResolver(aliases);
}

export function resolve(specifier: any, context: any, nextResolve: any) {
  return resolver(specifier, context, nextResolve);
}
