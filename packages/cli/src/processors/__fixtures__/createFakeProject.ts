import {readFileSync} from "node:fs";

import {join} from "path";

import {ProjectConvention} from "../../interfaces/ProjectConvention.js";
import {ProjectClient} from "../../services/ProjectClient.js";

const root = join(import.meta.dirname, "../../../templates/init");
const mockDir = join(import.meta.dirname, "__mock__");

export function createFakeProject({convention = ProjectConvention.DEFAULT}: {convention?: ProjectConvention}) {
  const project = new ProjectClient({
    fileSystem: undefined,
    useInMemoryFileSystem: true,
    rootDir: "/"
  });

  const indexContent = readFileSync(join(root, "src/index.ts"), {encoding: "utf8"});

  project.createSourceFile("src/index.ts", indexContent, {
    overwrite: true
  });

  const serverPath = convention === ProjectConvention.DEFAULT ? "src/Server.ts" : "src/server.ts";
  const serverContent = readFileSync(join(root, "src/server.ts"), "utf8");

  project.createSourceFile(serverPath, serverContent, {
    overwrite: true
  });

  const configContent = readFileSync(join(root, "src/config/config.ts"), "utf8");

  project.createSourceFile("src/config/config.ts", configContent, {
    overwrite: true
  });

  const binContent = readFileSync(join(root, "src/bin/index.ts"), "utf8");

  project.createSourceFile("src/bin/index.ts", binContent, {
    overwrite: true
  });

  const commandContent = readFileSync(join(mockDir, "TestCommand.ts"), "utf8");

  project.createSourceFile("src/bin/commands/TestCommand.ts", commandContent, {
    overwrite: true
  });

  return project;
}
