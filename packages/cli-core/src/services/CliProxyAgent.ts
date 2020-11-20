import tunnel from "tunnel";
import {Inject, Injectable} from "@tsed/di";
import {CliExeca} from "./CliExeca";

@Injectable()
export class CliProxyAgent {
  @Inject()
  protected cliExeca: CliExeca;

  protected proxyUrl: string | null;

  async $onInit() {
    await this.getProxyUrl();
  }

  hasProxy() {
    return !!this.proxyUrl;
  }

  get(type: "http" | "https") {
    if (this.proxyUrl) {
      const url = new URL(this.proxyUrl);
      const options = {
        proxy: {
          host: url.host,
          port: (url.port ? +url.port : undefined) as any
        }
      };

      if (url.protocol === "http" && type == "https") {
        return tunnel.httpsOverHttp(options);
      }

      if (url.protocol === "https" && type == "https") {
        return tunnel.httpsOverHttps(options);
      }

      if (url.protocol === "http" && type == "https") {
        return tunnel.httpOverHttps(options);
      }

      if (url.protocol === "http" && type == "http") {
        return tunnel.httpOverHttp(options);
      }
    }

    return null;
  }

  protected async getProxyUrl() {
    if (this.proxyUrl !== undefined) {
      return this.proxyUrl;
    }

    const {HTTP_PROXY, HTTPS_PROXY} = process.env;

    if (HTTP_PROXY || HTTPS_PROXY) {
      return HTTP_PROXY || HTTPS_PROXY;
    }

    if (this.hasYarn()) {
      const url = await this.getBestProxyUrl("yarn");
      if (url) {
        this.proxyUrl = url;
        return url;
      }
    }

    this.proxyUrl = await this.getBestProxyUrl("npm");

    return this.proxyUrl;
  }

  protected getProxy() {}

  private hasYarn() {
    try {
      this.cliExeca.runSync("yarn", ["--version"]);

      return true;
    } catch (er) {
      return false;
    }
  }

  protected async getBestProxyUrl(packageManager: string): Promise<string | null> {
    try {
      const [proxy, httpProxy, httpsProxy] = await Promise.all([
        this.cliExeca.getAsync(packageManager, ["config", "get", "proxy"]),
        this.cliExeca.getAsync(packageManager, ["config", "get", "http-proxy"]),
        this.cliExeca.getAsync(packageManager, ["config", "get", "https-proxy"])
      ]);

      return httpsProxy || httpProxy || proxy;
    } catch (er) {
      return null;
    }
  }
}
