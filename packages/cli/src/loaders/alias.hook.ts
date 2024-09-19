import generateAliasesResolver from "esm-module-alias";

const aliases = {
  "@tsed/core": import.meta.resolve("@tsed/core"),
  "@tsed/di": import.meta.resolve("@tsed/di"),
  "@tsed/schema": import.meta.resolve("@tsed/schema"),
  "@tsed/cli-core": import.meta.resolve("@tsed/cli-core"),
  "@tsed/cli": import.meta.resolve("@tsed/cli")
};

export const resolve = generateAliasesResolver(aliases);
