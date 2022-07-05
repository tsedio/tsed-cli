import {CliFs, Command, CommandProvider, Inject, Type} from "@tsed/cli-core";
import {Constant, InjectorService} from "@tsed/di";
import {importPackage, isString} from "@tsed/core";
import {camelCase} from "change-case";
import path, {join, resolve} from "path";
import {generateApi} from "swagger-typescript-api";

interface GenerateHttpClientCtx {
  output: string;
  type: "axios" | "fetch";
  name: string;
  suffix: string;
}

@Command({
  name: "generate-http-client",
  description: "Generate the client API from swagger spec",
  options: {
    "-s, --suffix <suffix>": {
      required: false,
      type: String,
      defaultValue: "Model",
      description: "The suffix applied on model"
    },
    "-t, --type <type>": {
      required: false,
      type: String,
      defaultValue: "axios",
      description: "The client type by the Http client (axios or fetch)"
    },
    "-n, --name <name>": {
      required: false,
      type: String,
      defaultValue: "ApiClient",
      description: "The class name of the generated client"
    },
    "-o, --output <output>": {
      required: true,
      type: String,
      description: "Path to generate files"
    }
  }
})
export class GenerateHttpClientCmd implements CommandProvider {
  @Inject()
  injector: InjectorService;

  @Inject()
  protected fs: CliFs;

  @Constant("server")
  protected serverModule: Type<any>;

  $mapContext($ctx: GenerateHttpClientCtx) {
    return {...$ctx, output: resolve(join(process.cwd(), $ctx.output))};
  }

  async $exec($ctx: GenerateHttpClientCtx) {
    return [
      {
        title: "generate client",
        task: () => this.generate($ctx)
      }
    ];
  }

  private async loadPlatformModule(): Promise<any> {
    let platform = await importPackage("@tsed/platform-express", undefined, true);

    if (platform) {
      return platform.PlatformExpress;
    }

    platform = await importPackage("@tsed/platform-koa", undefined, true);

    if (platform) {
      return platform.PlatformKoa;
    }

    throw new Error("Unsupported platform. Please use Express.js or Koa.js platform.");
  }

  private async generate($ctx: GenerateHttpClientCtx) {
    const Platform = await this.loadPlatformModule();
    const {SwaggerService} = await importPackage("@tsed/swagger");

    const platform: {injector: InjectorService} = await Platform.bootstrap(this.serverModule, {logger: {level: "off"}});
    const swaggerService = platform.injector.get<any>(SwaggerService)!;
    const confs = platform.injector.settings.get("swagger", []);

    await this.fs.raw.remove($ctx.output);
    await this.fs.ensureDir($ctx.output);

    const promises = confs.map(async (conf) => {
      const spec = await swaggerService.getOpenAPISpec(conf);

      await this.generateFromSpec(spec, $ctx);
    });

    await Promise.all(promises);
  }

  private async generateFromSpec(spec: any, $ctx: GenerateHttpClientCtx) {
    const {files} = await generateApi({
      name: `${$ctx.name}.ts`,
      httpClientType: $ctx.type,
      spec: spec as any,
      moduleNameIndex: 1,
      typeSuffix: $ctx.suffix,
      unwrapResponseData: true,
      hooks: {
        onCreateRouteName(routeNameInfo: any, raw: any) {
          const [, operationId] = raw.operationId.split("_");

          const name = raw.moduleName === "oidc" ? camelCase(routeNameInfo.original.replace("oidc", "")) : camelCase(operationId);

          routeNameInfo.usage = name;
          routeNameInfo.original = name;
          raw.operationId = name;

          return routeNameInfo;
        },
        onParseSchema(originalSchema: any, parsedSchema: any) {
          const {content} = parsedSchema;

          if (isString(content)) {
            if (content.includes("null") && content.includes("any") && content.includes("Record")) {
              parsedSchema.content = "any";
            }

            parsedSchema.content = parsedSchema.content.replace("object", "Record<string, any>");
          }

          return parsedSchema;
        }
      }
    } as any);

    const promises = files.map(({content, name}) => {
      content = content
        .replace("class Api", `class ${$ctx.name}`)
        .replace(".then((response) => response.data)", ".then((response) => response.data as T)")
        .replace('requestParams.headers.common = { Accept: "*/*" };', "")
        .replace("requestParams.headers.post = {};", "")
        .replace("requestParams.headers.put = {};", "")
        .replace("(this.instance.defaults.headers || {})", "((this.instance.defaults.headers || {}) as any)");

      console.log(`${$ctx.output}/${name}`, path.resolve(`${$ctx.output}/${name}`));
      return this.fs.writeFile(`${$ctx.output}/${name}`, content, {encoding: "utf8"});
    });

    return Promise.all(promises);
  }
}
