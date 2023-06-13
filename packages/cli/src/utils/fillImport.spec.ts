import {ArchitectureConvention} from "../interfaces";
import {fillImports} from "./fillImports";

describe("fillImports()", () => {
  it.each([
    {
      architecture: ArchitectureConvention.FEATURE,
      oidc: false,
      graphql: false,
      swagger: false,
      passportjs: false,
      express: false,
      koa: false,
      mongoose: false
    },
    {
      architecture: ArchitectureConvention.FEATURE,
      oidc: true,
      graphql: false,
      swagger: false,
      passportjs: false,
      express: true,
      koa: false,
      mongoose: false
    },
    {
      architecture: ArchitectureConvention.DEFAULT,
      oidc: true,
      graphql: false,
      swagger: false,
      passportjs: false,
      express: false,
      koa: true,
      mongoose: false
    },
    {
      architecture: ArchitectureConvention.FEATURE,
      oidc: false,
      graphql: false,
      swagger: true,
      passportjs: false,
      express: false,
      koa: false,
      mongoose: false
    },
    {
      architecture: ArchitectureConvention.DEFAULT,
      oidc: false,
      graphql: false,
      swagger: true,
      passportjs: false,
      express: false,
      koa: false,
      mongoose: false
    },
    {
      architecture: ArchitectureConvention.FEATURE,
      oidc: true,
      graphql: true,
      swagger: true,
      passportjs: true,
      express: true,
      koa: false,
      mongoose: true
    },
    {
      architecture: ArchitectureConvention.DEFAULT,
      oidc: true,
      graphql: true,
      swagger: true,
      passportjs: true,
      express: false,
      koa: true,
      mongoose: true
    }
  ])(
    "it should return barrels and imports files for ($architecture, oidc: $oidc, graphql: $graphql, swagger: $swagger, passportjs: $passportjs, express: $express, koa: $koa, mongoose: $mongoose)",
    (ctx) => {
      expect(fillImports(ctx)).toMatchSnapshot();
    }
  );
});
