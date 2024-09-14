import {CliFs, Command, CommandProvider, Inject, Type} from "@tsed/cli-core";
import {isString} from "@tsed/core";
import {Constant, InjectorService} from "@tsed/di";
import {camelCase} from "change-case";
import path, {join, resolve} from "path";
import {generateApi, Hooks, RawRouteInfo, RouteNameInfo} from "swagger-typescript-api";

export interface GenerateHttpClientCtx {
  output: string;
  type: "axios" | "fetch";
  name: string;
  suffix: string;
}

export interface GenerateHttpClientOpts {
  hooks?: Partial<Hooks>;

  transformOperationId?(operationId: string, routeNameInfo: RouteNameInfo, raw: RawRouteInfo): string;
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

  @Constant("httpClient", {hooks: {}})
  protected options: Partial<GenerateHttpClientOpts>;

  $mapContext($ctx: GenerateHttpClientCtx) {
    return {...$ctx, output: resolve(join(process.cwd(), $ctx.output))};
  }

  $exec($ctx: GenerateHttpClientCtx) {
    return [
      {
        title: "generate client",
        task: () => this.generate($ctx)
      }
    ];
  }

  private async loadPlatformModule(): Promise<any> {
    try {
      // @ts-ignore
      let platform = await import("@tsed/platform-express");

      if (platform) {
        return platform.PlatformExpress;
      }
    } catch (er) {}

    try {
      // @ts-ignore
      const platform = await import("@tsed/platform-koa");

      if (platform) {
        return platform.PlatformKoa;
      }
    } catch (er) {}
    throw new Error("Unsupported platform. Please use Express.js or Koa.js platform.");
  }

  private async generate($ctx: GenerateHttpClientCtx) {
    const Platform = await this.loadPlatformModule();
    // @ts-ignore
    const {SwaggerService} = await import("@tsed/swagger");

    const platform: {
      injector: InjectorService;
      stop: () => Promise<any>;
    } = await Platform.bootstrap(this.serverModule, {
      logger: {level: "off"},
      mongoose: [],
      redis: [],
      ioredis: []
    });
    const swaggerService = platform.injector.get<any>(SwaggerService)!;
    const confs = platform.injector.settings.get("swagger", []);

    await this.fs.raw.remove($ctx.output);
    await this.fs.ensureDir($ctx.output);

    const promises = confs.map(async (conf) => {
      const spec = await swaggerService.getOpenAPISpec(conf);

      await this.generateFromSpec(spec, conf, $ctx);
    });

    await Promise.all(promises);

    await platform.stop();
  }

  private async generateFromSpec(spec: any, conf: any, $ctx: GenerateHttpClientCtx) {
    const operationIdMode = !conf.operationId || conf.operationId === "%c_%m" ? "underscore" : "default";

    const {files} = await generateApi({
      name: `${$ctx.name}.ts`,
      httpClientType: $ctx.type,
      spec: spec as any,
      moduleNameIndex: 1,
      typeSuffix: $ctx.suffix,
      unwrapResponseData: true,
      hooks: {
        onCreateRouteName: (routeNameInfo: RouteNameInfo, rawRouteInfo: RawRouteInfo) =>
          this.createRouteName(routeNameInfo, rawRouteInfo, operationIdMode),
        onParseSchema: this.onParseSchema.bind(this),
        ...this.options.hooks
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

  private onParseSchema(originalSchema: any, parsedSchema: any) {
    const {content} = parsedSchema;

    if (isString(content)) {
      if (content.includes("null") && content.includes("any") && content.includes("Record")) {
        parsedSchema.content = "any";
      }

      parsedSchema.content = parsedSchema.content.replace("object", "Record<string, any>");
    }

    return parsedSchema;
  }

  private createRouteName(routeNameInfo: RouteNameInfo, raw: RawRouteInfo, mode: "default" | "underscore" = "default") {
    let operationId = "";

    if (mode === "underscore") {
      operationId = raw.operationId.split("_")[1];
    }

    operationId = operationId || raw.operationId.replace(raw.moduleName, "");

    const name = camelCase(
      this.options.transformOperationId ? this.options.transformOperationId(operationId, routeNameInfo, raw) : operationId
    );

    routeNameInfo.usage = name;
    routeNameInfo.original = name;
    raw.operationId = name;

    return routeNameInfo;
  }
}
