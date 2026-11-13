export enum PlatformType {
  EXPRESS = "express",
  KOA = "koa",
  FASTIFY = "fastify",
  FULMINE = "fulmine"
}

declare global {
  namespace TsED {
    interface ProjectPreferences {
      platform: PlatformType;
    }
  }
}
