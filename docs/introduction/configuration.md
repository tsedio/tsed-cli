---
title: CLI configuration
description: Configure network proxies and environment variables used by the Ts.ED CLI binaries.
---

# CLI configuration

Most teams can run `tsed` and `tsed-mcp` with zero setup, but locked-down networks sometimes need explicit proxy values. The CLI reuses npm's config files and environment variables, so anything that works for npm also works here.

## Proxy settings via npm config

Set the proxy values once and every CLI command—project generation, MCP server bootstrap, package installs—will respect them:

```sh
npm config set proxy http://username:password@host:port
npm config set https-proxy http://username:password@host:port
```

These commands update your global `~/.npmrc`. You can edit that file directly if you prefer:

```
proxy=http://username:password@host:port
https-proxy=http://username:password@host:port
https_proxy=http://username:password@host:port
```

## Environment variables

When scripting inside CI pipelines (where editing `.npmrc` is inconvenient), export the standard variables before invoking the CLI:

- `HTTPS_PROXY` / `HTTP_PROXY`: primary proxy URLs.
- `NO_PROXY`: comma-separated hostnames to bypass the proxy (useful for `localhost` or internal registries).
- `NODE_TLS_REJECT_UNAUTHORIZED=0`: opt-out of TLS verification for self-signed certs. Use only in trusted environments.

Because the CLI spins up HTTP clients for prompts, tasks, and MCP transports, make sure whichever method you choose (npm config or env vars) is in place before running `tsed ...` or `tsed-mcp`.
