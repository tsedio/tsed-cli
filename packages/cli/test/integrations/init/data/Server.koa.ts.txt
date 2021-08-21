import {Configuration, Inject} from "@tsed/di";
import {PlatformApplication} from "@tsed/common";
import "@tsed/platform-koa"; // /!\ keep this import
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import cors from "@koa/cors";
import "@tsed/ajv";
import {config, rootDir} from "./config";

const methodOverride = require("koa-override");


@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  mount: {
    "/rest": [
      `${rootDir}/controllers/**/*.ts`
    ]
  },
  views: {
    root: `${rootDir}/views`,
    extensions: {
      ejs: "ejs"
    }
  },
  exclude: [
    "**/*.spec.ts"
  ]
})
export class Server {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  $beforeRoutesInit(): void {

    this.app
      .use(cors())
      .use(compress())
      .use(methodOverride())
      .use(bodyParser())
  }
}
