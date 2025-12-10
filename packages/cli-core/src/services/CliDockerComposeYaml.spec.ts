// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliDockerComposeYaml} from "./CliDockerComposeYaml.js";
import {CliFs} from "./CliFs.js";
import {CliYaml} from "./CliYaml.js";
import {ProjectPackageJson} from "./ProjectPackageJson.js";

describe("CliDockerComposeYaml", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  async function createService(deps: Partial<Record<string, any>> = {}) {
    const cliYaml = deps.cliYaml || {
      read: vi.fn().mockResolvedValue({}),
      write: vi.fn().mockResolvedValue(undefined)
    };
    const fs = deps.fs || {
      exists: vi.fn().mockReturnValue(true),
      findUpFile: vi.fn().mockReturnValue(undefined)
    };
    const projectPkg = deps.projectPkg || ({dir: "/project"} as ProjectPackageJson);

    const service = await CliPlatformTest.invoke<CliDockerComposeYaml>(CliDockerComposeYaml, [
      {
        token: CliYaml,
        use: cliYaml
      },
      {
        token: CliFs,
        use: fs
      },
      {
        token: ProjectPackageJson,
        use: projectPkg
      }
    ]);

    return {service, cliYaml, fs, projectPkg};
  }

  describe("read()", () => {
    it("should read docker-compose.yml from project root when it exists", async () => {
      const {service, cliYaml, fs} = await createService();

      const result = await service.read();

      expect(fs.exists).toHaveBeenCalledWith("docker-compose.yml");
      expect(cliYaml.read).toHaveBeenCalledWith("docker-compose.yml");
      expect(result).toEqual({});
    });

    it("should return an empty object when no docker-compose file is found", async () => {
      const fs = {
        exists: vi.fn().mockReturnValue(false),
        findUpFile: vi.fn().mockReturnValue(undefined)
      };
      const {service, cliYaml} = await createService({fs});

      const result = await service.read();

      expect(fs.findUpFile).toHaveBeenCalled();
      expect(cliYaml.read).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe("write()", () => {
    it("should write to the discovered docker-compose file", async () => {
      const cliYaml = {
        read: vi.fn(),
        write: vi.fn().mockResolvedValue(undefined)
      };
      const fs = {
        exists: vi.fn(),
        findUpFile: vi.fn().mockReturnValue("/repo/docker-compose.yml")
      };
      const {service} = await createService({cliYaml, fs});
      const payload = {services: {}};

      await service.write(payload);

      expect(cliYaml.write).toHaveBeenCalledWith("/repo/docker-compose.yml", payload);
    });

    it("should fallback to project dir when docker-compose file does not exist yet", async () => {
      const cliYaml = {
        read: vi.fn(),
        write: vi.fn().mockResolvedValue(undefined)
      };
      const fs = {
        exists: vi.fn(),
        findUpFile: vi.fn().mockReturnValue(undefined)
      };
      const projectPkg = {dir: "/repo"} as ProjectPackageJson;
      const {service} = await createService({cliYaml, fs, projectPkg});
      const payload = {services: {}};

      await service.write(payload);

      expect(cliYaml.write).toHaveBeenCalledWith("/repo/docker-compose.yml", payload);
    });
  });

  describe("addDatabaseService()", () => {
    it("should append a postgres service and persist the file", async () => {
      const cliYaml = {
        read: vi.fn().mockResolvedValue({services: {}}),
        write: vi.fn().mockResolvedValue(undefined)
      };
      const fs = {
        exists: vi.fn().mockReturnValue(true),
        findUpFile: vi.fn()
      };
      const {service} = await createService({cliYaml, fs});

      await service.addDatabaseService("OrdersDb", "postgres");

      expect(cliYaml.write).toHaveBeenCalledTimes(1);
      const [, dockerCompose] = cliYaml.write.mock.calls[0];
      expect(dockerCompose).toEqual({
        services: {
          orders_db: {
            image: "postgres:9.6.1",
            ports: ["5432:5432"],
            volumes: ["./pgdata:/var/lib/postgresql/data"],
            environment: {
              POSTGRES_USER: "test",
              POSTGRES_PASSWORD: "test",
              POSTGRES_DB: "test"
            }
          }
        }
      });
    });

    it("should append a mongodb service definition when requested", async () => {
      const cliYaml = {
        read: vi.fn().mockResolvedValue({services: {}}),
        write: vi.fn().mockResolvedValue(undefined)
      };
      const fs = {
        exists: vi.fn().mockReturnValue(true),
        findUpFile: vi.fn()
      };
      const {service} = await createService({cliYaml, fs});

      await service.addDatabaseService("Analytics", "mongodb");

      expect(cliYaml.write).toHaveBeenCalledTimes(1);
      const [, dockerCompose] = cliYaml.write.mock.calls[0];
      expect(dockerCompose).toEqual({
        services: {
          analytics: {
            image: "mongo:5.0.8",
            ports: ["27017:27017"]
          }
        }
      });
    });
  });
});
