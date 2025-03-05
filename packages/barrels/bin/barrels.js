#!/usr/bin/env node
import {generateBarrels} from "./generate-barrel.js";
import {getConfig} from "./get-config.js";

async function build() {
  const {directory = ["./src"], exclude = ["**/__mock__", "**/__mocks__", "**/*.spec.ts", "**/*.benchmark.ts"], noSemicolon = false} = await getConfig();

  await generateBarrels({exclude, directory, cwd: process.cwd(), noSemicolon});
}

await build();
