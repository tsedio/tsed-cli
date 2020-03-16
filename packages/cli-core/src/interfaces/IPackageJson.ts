export interface IPackageJson {
  name: string;
  version: string;
  description: string;
  scripts: {[key: string]: string};
  dependencies: {[key: string]: string};
  devDependencies: {[key: string]: string};

  [key: string]: any;
}

export interface IPackageInfo {
  _id: string;
  _rev: string;
  name: string;
  "dist-tags": {
    [key: string]: string;
  };
  versions: {
    [key: string]: IPackageJson;
  };
  time: {
    [key: string]: string;
  };
  maintainers: {email: string; name: string}[];
  description: string;
  homepage: string;
  keywords: string[];
  repository: {
    type: string;
    url: string;
  };
  author: {
    name: string;
  };
  bugs: {
    url: string;
  };
  license: string;
  readme: string;
}
