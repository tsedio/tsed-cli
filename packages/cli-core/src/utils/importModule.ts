export function importModule(mod: string, root: string = process.cwd()) {
  const path = require.resolve(mod, {
    paths: [root, __dirname]
  });

  return import(path);
}
