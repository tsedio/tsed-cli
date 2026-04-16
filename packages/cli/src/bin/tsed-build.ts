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

type ResolveFn = (specifier: string) => string | Promise<string>;

export async function resolveViteBin(resolve: ResolveFn = import.meta.resolve) {
  const packageJsonPath = fileURLToPath(await resolve("vite/package.json"));
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8")) as {
    bin?: string | Record<string, string>;
  };
  const binRelativePath = typeof packageJson.bin === "string" ? packageJson.bin : packageJson.bin?.vite;

  if (!binRelativePath) {
    throw new Error("Unable to resolve Vite CLI binary from vite/package.json");
  }

  return path.resolve(path.dirname(packageJsonPath), binRelativePath);
}

export async function build(rawArgs: string[] = process.argv.slice(2)) {
  const viteBin = await resolveViteBin();
  await runNode(process.execPath, [viteBin, "build", ...rawArgs]);
}
