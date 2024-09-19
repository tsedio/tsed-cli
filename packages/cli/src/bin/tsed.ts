#!/usr/bin/env node
import {register} from "node:module";
import {pathToFileURL} from "node:url";

register(pathToFileURL(`${import.meta.dirname}/../alias.hook.js`));

const {Cli} = await import("../Cli.js");

Cli.bootstrap({}).catch((error) => {
  console.error(error);
  process.exit(-1);
});
