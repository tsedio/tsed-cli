import "../src/index.js";

import {GenerateCmd, TEMPLATE_DIR} from "@tsed/cli";
import {ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs, FakeCliHttpClient} from "@tsed/cli-testing";
import {inject} from "@tsed/di";

describe("Generate protocols", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  beforeEach(() => {
    FakeCliHttpClient.entries.set("https://www.passportjs.org/packages/-/all.json:{}", () => ({
      "passport-local": {
        name: "passport-local",
        description: "Local username and password authentication strategy for Passport.",
        "dist-tags": {
          latest: "1.0.0"
        }
      },
      "passport-http": {
        name: "passport-http",
        description: "HTTP Basic and Digest authentication strategies for Passport.",
        "dist-tags": {
          latest: "1.0.0"
        }
      },
      "passport-jwt": {
        name: "passport-jwt",
        description: "Jwt authentication strategy for Passport.",
        "dist-tags": {
          latest: "1.0.0"
        }
      },
      "passport-discord": {
        name: "passport-discord",
        description: "Discord authentication strategy for Passport.",
        "dist-tags": {
          latest: "1.0.0"
        }
      },
      "passport-facebook": {
        name: "passport-facebook",
        description: "Facebook authentication strategy for Passport.",
        "dist-tags": {
          latest: "1.0.0"
        }
      },
      "passport-other": {
        name: "passport-other",
        description: "Other strategy Passport.",
        "dist-tags": {
          latest: "1.0.0"
        }
      }
    }));
  });
  afterEach(() => CliPlatformTest.reset());

  it("should generate the template (passport local)", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "protocol",
      passportPackage: "passport-local",
      name: "Local"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/src/protocols/LocalProtocol.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/protocols/LocalProtocol.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { OnInstall, OnVerify, Protocol } from "@tsed/passport";
      import { Req } from "@tsed/platform-http";
      import { BodyParams } from "@tsed/platform-params";
      import { IStrategyOptions, Strategy } from "passport-local";

      @Protocol<IStrategyOptions>({
        name: "local",
        useStrategy: Strategy,
        settings: {
          usernameField: "email",
          passwordField: "password"
        }
      })
      export class LocalProtocol implements OnVerify, OnInstall {
        async $onVerify(@Req() request: Req, @BodyParams() credentials: any) {
          const { email, password } = credentials;

        }

        $onInstall(strategy: Strategy): void {
          // intercept the strategy instance to adding extra configuration
        }
      }
      "
    `);

    expect(inject(ProjectPackageJson).dependencies).toMatchInlineSnapshot(`
      {
        "@swc-node/register": "latest",
        "@swc/cli": "latest",
        "@swc/core": "latest",
        "@swc/helpers": "latest",
        "@tsed/ajv": "5.58.1",
        "@tsed/barrels": "latest",
        "@tsed/config": "5.58.1",
        "@tsed/core": "5.58.1",
        "@tsed/di": "5.58.1",
        "@tsed/engines": "latest",
        "@tsed/exceptions": "5.58.1",
        "@tsed/json-mapper": "5.58.1",
        "@tsed/logger": "latest",
        "@tsed/openspec": "5.58.1",
        "@tsed/platform-cache": "5.58.1",
        "@tsed/platform-exceptions": "5.58.1",
        "@tsed/platform-express": "5.58.1",
        "@tsed/platform-http": "5.58.1",
        "@tsed/platform-log-request": "5.58.1",
        "@tsed/platform-middlewares": "5.58.1",
        "@tsed/platform-multer": "5.58.1",
        "@tsed/platform-params": "5.58.1",
        "@tsed/platform-response-filter": "5.58.1",
        "@tsed/platform-views": "5.58.1",
        "@tsed/schema": "5.58.1",
        "ajv": "latest",
        "body-parser": "latest",
        "compression": "latest",
        "cookie-parser": "latest",
        "cors": "latest",
        "cross-env": "latest",
        "express": "latest",
        "method-override": "latest",
        "passport-local": "1.0.0",
        "typescript": "latest",
      }
    `);
    expect(inject(ProjectPackageJson).devDependencies).toMatchInlineSnapshot(`
      {
        "@types/compression": "latest",
        "@types/cookie-parser": "latest",
        "@types/cors": "latest",
        "@types/express": "latest",
        "@types/method-override": "latest",
        "@types/multer": "latest",
        "@types/node": "latest",
        "@types/passport": "latest",
        "nodemon": "latest",
        "passport": "latest",
        "tslib": "latest",
      }
    `);
  });
  it("should generate the template (passport http)", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "protocol",
      passportPackage: "passport-http",
      name: "Local"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/src/protocols/LocalProtocol.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/protocols/LocalProtocol.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { OnInstall, OnVerify, Protocol } from "@tsed/passport";
      import { Req } from "@tsed/platform-http";
      import { BodyParams } from "@tsed/platform-params";
      import { BasicStrategy } from "passport-http";

      @Protocol({
        name: "local",
        useStrategy: BasicStrategy,
        settings: {}
      })
      export class LocalProtocol implements OnVerify, OnInstall {
        async $onVerify(@Req() request: Req, @BodyParams() credentials: any) {
          const { username, password } = credentials;

        }

        $onInstall(strategy: Strategy): void {
          // intercept the strategy instance to adding extra configuration
        }
      }
      "
    `);
  });
  it("should generate the template (passport jwt)", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "protocol",
      passportPackage: "passport-jwt",
      name: "Local"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/src/protocols/LocalProtocol.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/protocols/LocalProtocol.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { Arg, OnVerify, Protocol } from "@tsed/passport";
      import { Req } from "@tsed/platform-http";
      import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";

      @Protocol<StrategyOptions>({
        name: "local",
        useStrategy: Strategy,
        settings: {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: "secret",
          issuer: "accounts.examplesoft.com",
          audience: "yoursite.net"
        }
      })
      export class LocalProtocol implements OnVerify {
        async $onVerify(@Req() req: Req, @Arg(0) jwtPayload: { sub: string }) {
          const token = jwtPayload.sub;

        }
      }
      "
    `);
  });
  it("should generate the template (passport discord)", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "protocol",
      passportPackage: "passport-discord",
      name: "Local"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/src/protocols/LocalProtocol.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/protocols/LocalProtocol.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { Args, OnInstall, OnVerify, Protocol } from "@tsed/passport";
      import { Req } from "@tsed/platform-http";
      import { Strategy, StrategyOptions } from "passport-discord";
      import * as refresh from "passport-oauth2-refresh";

      @Protocol<StrategyOptions>({
        name: "local",
        useStrategy: Strategy,
        settings: {
          clientID: "id",
          clientSecret: "secret",
          callbackURL: "callbackURL"
        }
      })
      export class LocalProtocol implements OnVerify, OnInstall {
        async $onVerify(@Req() req: Req, @Args() [accessToken, refreshToken, profile]: any) {
          profile.refreshToken = refreshToken;

          // const user = await this.authService.findOne({discordId: profile.id});

          // return user ? user : false;
        }

        async $onInstall(strategy: Strategy) {
          refresh.use(strategy);
        }
      }
      "
    `);
  });
  it("should generate the template (passport facebook)", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "protocol",
      passportPackage: "passport-facebook",
      name: "Local"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/src/protocols/LocalProtocol.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/protocols/LocalProtocol.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { Args, OnInstall, OnVerify, Protocol } from "@tsed/passport";
      import { Req } from "@tsed/platform-http";
      import { Strategy, StrategyOptions } from "passport-facebook";


      @Protocol<StrategyOptions>({
        name: "local",
        useStrategy: Strategy,
        settings: {
          clientID: "FACEBOOK_APP_ID",
          clientSecret: "FACEBOOK_APP_SECRET",
          callbackURL: "http://www.example.com/auth/facebook/callback",
          profileFields: ["id", "emails", "name"]
        }
      })
      export class LocalProtocol implements OnVerify, OnInstall {
        async $onVerify(@Req() req: Req, @Args() [accessToken, refreshToken, profile]: any) {
          profile.refreshToken = refreshToken;

          // const user = await this.authService.findOne({facebookId: profile.id});

          // return user ? user : false;
        }
      }
      "
    `);
  });
  it("should generate the template (passport generic)", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "protocol",
      passportPackage: "passport-other",
      name: "Local"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/src/protocols/LocalProtocol.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/protocols/LocalProtocol.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { Args, OnInstall, OnVerify, Protocol } from "@tsed/passport";
      import { Req } from "@tsed/platform-http";
      import { Strategy } from "passport-other";

      @Protocol({
        name: "local",
        useStrategy: Strategy,
        settings: {}
      })
      export class LocalProtocol implements OnVerify, OnInstall {
        async $onVerify(@Req() request: Req, @Args() args: any[]) {
          const [] = args;

        }

        $onInstall(strategy: Strategy): void {
          // intercept the strategy instance to adding extra configuration
        }
      }
      "
    `);
  });
});
