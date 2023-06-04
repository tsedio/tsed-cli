const mono = require("@tsed/monorepo-utils");
const {dirname, join, relative} = require("path");
const {writeJson, readFile, writeFile} = require("fs-extra");

const scriptDir = __dirname;

async function main() {
  const monoRepo = new mono.MonoRepo({
    rootDir: process.cwd(), verbose: false
  });

  const packages = await mono.findPackages(monoRepo);
  const template = await readFile(join(scriptDir, "./jest.config.template.js"));

  const promises = packages.map(async (pkg) => {
    const path = dirname(pkg.path);

    if (!pkg.pkg.private) {
      await writeFile(join(path, "jest.config.js"), template, {spaces: 2});

      pkg.pkg.scripts["test"] = "cross-env NODE_ENV=test yarn jest --max-workers=2 && jest-coverage-thresholds-bumper\",\n";

      pkg.pkg.devDependencies["@tsed/jest-config"] = pkg.pkg.version;
      pkg.pkg.devDependencies["jest"] = monoRepo.rootPkg.devDependencies["jest"];
      pkg.pkg.devDependencies["cross-env"] = monoRepo.rootPkg.devDependencies["cross-env"];

      await writeJson(pkg.path, pkg.pkg, {spaces: 2});
    }
  });

  await Promise.all(promises);
}

main();
