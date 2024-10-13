export interface PackageJson {
  name: string;
  version: string;
  description: string;
  type: "module";
  scripts: {[key: string]: string};
  dependencies: {[key: string]: string};
  devDependencies: {[key: string]: string};

  [key: string]: any;
}

export interface PackageInfo {
  _id: string;
  _rev: string;
  name: string;
  type: "module";
  "dist-tags": {
    [key: string]: string;
  };
  versions: {
    [key: string]: PackageJson;
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
