import url from "node:url";

import {inject, Injectable} from "@tsed/di";
import registry_auth_token from "registry-auth-token";
import registry_url from "registry-url";

import type {PackageInfo} from "../interfaces/PackageJson.js";
import {CliHttpClient} from "./CliHttpClient.js";

const REGEX_REGISTRY_ENFORCED_HTTPS = /^https?:\/\/([^\/]+\.)?(yarnpkg\.com|npmjs\.(org|com))(\/|$)/;
const REGEX_REGISTRY_PREFIX = /^(https?:)?\/\//i;

export function addSuffix(pattern: string, suffix: string): string {
  if (!pattern.endsWith(suffix)) {
    return pattern + suffix;
  }

  return pattern;
}

export const SCOPE_SEPARATOR = "%2f";

@Injectable()
export class NpmRegistryClient {
  private httpClient = inject(CliHttpClient);
  private host = registry_url();

  static escapeName(name: string): string {
    // scoped packages contain slashes and the npm registry expects them to be escaped
    return name.replace("/", SCOPE_SEPARATOR);
  }

  async request(pathname: string, opts: any = {}): Promise<any> {
    const registry = opts.registry || this.host;
    const requestUrl = this.getRequestUrl(registry, pathname);

    const headers = {
      Accept: opts.unfiltered ? "application/json" : "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
      ...opts.headers
    };

    if (!headers.Authorization) {
      this.addAuthorization(registry, headers);
    }

    try {
      return await this.httpClient.get(requestUrl, {
        ...opts,
        headers
      });
    } catch (error) {
      if (opts.retry) {
        await new Promise((resolve: any) => setTimeout(resolve, 200));
        opts.retry -= 1;
        opts.unfiltered = true;

        return this.request(NpmRegistryClient.escapeName(pathname), opts);
      }

      throw error;
    }
  }

  getRequestUrl(registry: string, pathname: string): string {
    let resolved = pathname;

    if (!REGEX_REGISTRY_PREFIX.test(pathname)) {
      resolved = url.resolve(addSuffix(registry, "/"), pathname);
    }

    if (REGEX_REGISTRY_ENFORCED_HTTPS.test(resolved)) {
      resolved = resolved.replace(/^http:\/\//, "https://");
    }

    return resolved;
  }

  /**
   * Search a module on npm registry
   * @param text
   * @param options
   */
  async search(text: string, options: {size?: number; from?: number; quality?: number; popularity?: number; maintenance?: number} = {}) {
    const {objects: result} = await this.request(`-/v1/search`, {
      headers: {
        "Accept-Encoding": "gzip"
      },
      qs: {
        text,
        size: 100,
        from: 0,
        quality: 0.65,
        popularity: 0.98,
        maintenance: 0.5,
        ...options
      }
    });

    return result;
  }

  async info(packageName: string, retry = 0): Promise<PackageInfo> {
    try {
      return await this.request(packageName, {
        headers: {
          "Accept-Encoding": "gzip"
        },
        unfiltered: false,
        retry
      });
    } catch (er) {
      return retry == 0 ? this.fallback(packageName) : null;
    }
  }

  private async fallback(packageName: string) {
    const [{package: pkg}] = await this.search(packageName);

    return {
      ...pkg,
      "dist-tags": {
        latest: pkg.version
      },
      versions: {
        [pkg.version]: {
          name: packageName,
          version: pkg.version,
          dependencies: {},
          devDependencies: {}
        }
      }
    };
  }

  private addAuthorization(registry: string, headers: Record<string, string>) {
    const authInfo = registry_auth_token(registry, {recursive: true});

    if (authInfo) {
      headers.Authorization = `${authInfo.type} ${authInfo.token}`;
    }
  }
}
