import {ArchitectureConvention, PlatformType} from "../interfaces/index.js";

export function fillImports(ctx: any) {
  ctx = {...ctx};
  Object.values(PlatformType).forEach((type) => {
    ctx[type] = ctx.platform === type;
  });

  const isFeature = ctx.architecture === ArchitectureConvention.FEATURE;

  ctx.barrels = JSON.stringify(
    [
      isFeature ? "./src/rest" : "./src/controllers/rest",
      ctx.swagger && (isFeature ? "./src/pages" : "./src/controllers/pages"),
      ctx.oidc && "./src/interactions",
      ctx.graphql && "./src/datasources",
      ctx.graphql && "./src/resolvers"
    ].filter(Boolean)
  );

  ctx.imports = [
    ctx.express && {from: "@tsed/platform-express", comment: " // /!\\ keep this import"},
    ctx.koa && {from: "@tsed/platform-koa", comment: " // /!\\ keep this import"},
    {from: "@tsed/ajv"},
    ctx.swagger && {from: "@tsed/swagger"},
    ctx.mongoose && {from: "@tsed/mongoose"},
    ctx.oidc && {from: "@tsed/oidc-provider"},
    ctx.passportjs && {from: "@tsed/passport"},
    ctx.graphql && {from: "@tsed/typegraphql"},
    ctx.graphql && {from: "./datasources/index.js"},
    ctx.graphql && {from: "./resolvers/index.js"},
    {symbols: "{config}", from: "./config/index.js"},
    {symbols: "* as rest", from: isFeature ? "./rest/index.js" : "./controllers/rest/index.js"},
    (ctx.swagger || ctx.oidc) && {
      symbols: "* as pages",
      from: isFeature ? "./pages/index.js" : "./controllers/pages/index.js"
    },
    ctx.oidc && {symbols: "{InteractionsController}", from: "./controllers/oidc/InteractionsController.js"}
  ].filter(Boolean);

  return ctx;
}
