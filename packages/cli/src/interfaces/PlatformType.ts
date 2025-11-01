export enum PlatformType {
  EXPRESS = "express",
  KOA = "koa",
  FASTIFY = "fastify"
}

declare global {
  namespace TsED {
    interface ProjectPreferences {
      platform: PlatformType;
    }
  }
}
