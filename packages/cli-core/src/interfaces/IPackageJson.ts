export interface IPackageJson {
  name: string;
  version: string;
  description: string;
  scripts: {[key: string]: string};
  dependencies: {[key: string]: string};
  devDependencies: {[key: string]: string};
}
