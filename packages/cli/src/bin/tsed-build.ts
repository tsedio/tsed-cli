import {spawn} from "node:child_process";
import {readFile} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {fileURLToPath} from "node:url";

function runNode(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {
      env: process.env,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`vite build exited with code ${code}`));
    });
  });
}

function toPath(value: string) {
  if (value.startsWith("file://")) {
    return fileURLToPath(value);
  }

  return value;
}

export async function resolveViteBinFromPackageJsonPath(packageJsonPath: string) {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8")) as {
    bin?: string | Record<string, string>;
  };
  const binRelativePath = typeof packageJson.bin === "string" ? packageJson.bin : packageJson.bin?.vite;

  if (!binRelativePath) {
    throw new Error("Unable to resolve Vite CLI binary from vite/package.json");
  }

  return path.resolve(path.dirname(packageJsonPath), binRelativePath);
}

export async function resolveViteBin() {
  const packageJsonPath = toPath(await import.meta.resolve("vite/package.json"));

  return resolveViteBinFromPackageJsonPath(packageJsonPath);
}

export async function build(rawArgs: string[] = process.argv.slice(2)) {
  const viteBin = await resolveViteBin();
  await runNode(process.execPath, [viteBin, "build", ...rawArgs]);
}
