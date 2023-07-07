import tunnel from "tunnel";
import {Configuration, Inject, Injectable, Value} from "@tsed/di";
import {CliExeca} from "./CliExeca";
import {camelCase} from "change-case";
import {URL} from "url";
import {coerce} from "../utils/coerce";

export interface CliProxySettings {
  url: string;
  strictSsl: boolean;
}

@Injectable()
@Configuration({
  proxy: {
    url: process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
    strictSsl: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== undefined ? process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0" : true
  }
})
export class CliProxyAgent {
  @Value("proxy", {})
  proxySettings: CliProxySettings;

  @Inject()
  protected cliExeca: CliExeca;

  hasProxy() {
    return !!this.proxySettings.url;
  }

  get(type: "http" | "https") {
    if (this.hasProxy()) {
      const {strictSsl = true} = this.proxySettings;
      const url = new URL(this.proxySettings.url);
      const protocol = url.protocol.replace(":", "");

      const options = {
        proxy: {
          host: url.hostname,
          port: (url.port ? +url.port : undefined) as any,
          proxyAuth: url.username && url.password ? `${url.username}:${url.password}` : undefined,
          rejectUnauthorized: strictSsl
        }
      };

      const method = camelCase([type, "over", protocol].join(" "));

      if ((tunnel as any)[method]) {
        return (tunnel as any)[method](options);
      }
    }

    return null;
  }

  async resolveProxySettings(): Promise<void> {
    const hasProxy = this.hasProxy();

    if (hasProxy) {
      return;
    }

    const result = await Promise.all([
      this.cliExeca.getAsync("npm", ["config", "get", "proxy"]),
      this.cliExeca.getAsync("npm", ["config", "get", "http-proxy"]),
      this.cliExeca.getAsync("npm", ["config", "get", "https-proxy"]),
      this.cliExeca.getAsync("npm", ["config", "get", "strict-ssl"])
    ]);

    const [proxy, httpProxy, httpsProxy, strictSsl] = result.map(coerce);
    const url = httpsProxy || httpProxy || proxy;

    if (url) {
      this.proxySettings = {
        url,
        strictSsl: coerce(strictSsl) !== false
      };
    }
  }
}
