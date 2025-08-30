import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "server",
  label: "Server",
  description: "Create a new server file",
  outputDir: "{{srcDir}}",
  fileName: "server",
  hidden: true,

  render() {
    return `import "@tsed/platform-log-request";
import "@tsed/ajv";

import {join} from "node:path";
import {Configuration} from "@tsed/di";
import {application} from "@tsed/platform-http";

import {config} from "@/config/config.js";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  mount: {},
  views: {
    root: join(process.cwd(), "../views"),
    extensions: {
      ejs: "ejs"
    }
  }
})
export class Server {
  protected app = application();
}
`;
  }
});
