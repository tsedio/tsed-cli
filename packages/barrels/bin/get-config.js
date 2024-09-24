import {join} from "node:path";
import {existsSync} from "node:fs";
import {readFile} from "node:fs/promises";

function resolveConfig() {
  return [
    join(process.cwd(), ".barrelsby.json"),
    join(process.cwd(), ".barrels.json")
  ].find((path) => {
    return existsSync(path);
  });
}

async function readJSON(path) {
  const content = await readFile(path, "utf-8");

  return JSON.parse(content);
}

export function getConfig() {
  const configPath = resolveConfig();

  if (!configPath) {
    return {};
  }

  return readJSON(configPath);
}
