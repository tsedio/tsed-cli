import {spawn} from "node:child_process";
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

export async function build(rawArgs: string[] = process.argv.slice(2)) {
  const viteBin = fileURLToPath(import.meta.resolve("vite/bin/vite.js"));
  await runNode(process.execPath, [viteBin, "build", ...rawArgs]);
}
