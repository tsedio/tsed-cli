#!/usr/bin/env node
import {generateBarrels} from "../src/generate-barrel.js";
import {getConfig} from "../src/get-config.js";

async function build() {
  const {
    directory = ["./src"],
    exclude = ["**/__mock__", "**/__mocks__", "**/*.spec.ts", "**/*.benchmark.ts"],
  } = await getConfig();
  await generateBarrels({exclude, directory, cwd: process.cwd()});
}

await build();
