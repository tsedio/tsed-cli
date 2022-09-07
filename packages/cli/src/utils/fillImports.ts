import {ArchitectureConvention, PlatformType} from "../interfaces";

export function fillImports(ctx: any) {
  ctx = {...ctx};
  Object.values(PlatformType).forEach((type) => {
    ctx[type] = ctx.platform === type;
  });

  const isFeature = ctx.architecture === ArchitectureConvention.FEATURE;

  ctx.barrels = JSON.stringify(
    [
      isFeature ? "./src/rest" : "./src/controllers/rest",
      (ctx.swagger || ctx.oidc) && (isFeature ? "./src/pages" : "./src/controllers/pages"),
      ctx.oidc && "./src/interactions",
      ctx.graphql && "./src/datasources",
      "./src/resolvers"
    ].filter(Boolean)
  );

  ctx.imports = [
    ctx.express && {from: "@tsed/platform-express", comment: " // /!\\ keep this import"},
    ctx.express && {symbols: "bodyParser", from: "body-parser"},
    ctx.express && {symbols: "compress", from: "compression"},
    ctx.express && {symbols: "cookieParser", from: "cookie-parser"},
    ctx.express && {symbols: "methodOverride", from: "method-override"},
    ctx.express && {symbols: "cors", from: "cors"},
    ctx.koa && {from: "@tsed/platform-koa", comment: " // /!\\ keep this import"},
    ctx.koa && {symbols: "bodyParser", from: "koa-bodyparser"},
    ctx.koa && {symbols: "compress", from: "koa-compress"},
    ctx.koa && {symbols: "cors", from: "@koa/cors"},
    ctx.koa && {symbols: "methodOverride", from: "koa-override", tsIgnore: true},
    {from: "@tsed/ajv"},
    ctx.swagger && {from: "@tsed/swagger"},
    ctx.mongoose && {from: "@tsed/mongoose"},
    ctx.oidc && {from: "@tsed/oidc-provider"},
    ctx.graphql && {from: "@tsed/typegraphql"},
    ctx.graphql && {from: "./datasources/index"},
    ctx.graphql && {from: "./resolvers/index"},
    {symbols: "{config}", from: "./config/index"},
    {symbols: "* as rest", from: isFeature ? "./rest/index" : "./controllers/rest/index"},
    (ctx.swagger || ctx.oidc) && {
      symbols: "* as pages",
      from: isFeature ? "./pages/index" : "./controllers/pages/index"
    },
    ctx.oidc && {symbols: "{InteractionsController}", from: "./controllers/oidc/InteractionsController"}
  ].filter(Boolean);

  return ctx;
}
