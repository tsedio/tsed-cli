import {defineTemplate} from "../utils/defineTemplate.js";

export default defineTemplate({
  id: "index.controller",
  label: "Index Controller",
  description: "Create a new index controller file",
  outputDir: "{{srcDir}}/controllers/pages",
  fileName: "index.controller",
  hidden: true,

  render() {
    return `import {Constant, Controller} from "@tsed/di";
import {HeaderParams} from "@tsed/platform-params";
import {View} from "@tsed/platform-views";
import {SwaggerSettings} from "@tsed/swagger";
import {Hidden, Get, Returns} from "@tsed/schema";

@Hidden()
@Controller("/")
export class IndexController {
  @Constant("swagger", [])
  private swagger: SwaggerSettings[];

  @Get("/")
  @View("swagger.ejs")
  @(Returns(200, String).ContentType("text/html"))
  get(@HeaderParams("x-forwarded-proto") protocol: string, @HeaderParams("host") host: string) {
    const hostUrl = \`\${protocol || "http"}://\${host}\`;

    return {
      BASE_URL: hostUrl,
      docs: this.swagger.map((conf) => {
        return {
          url: hostUrl + conf.path,
          ...conf
        };
      })
    };
  }
}`;
  }
});
