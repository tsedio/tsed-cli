#!/usr/bin/env node
import {Cli} from "../Cli.js";

Cli.bootstrap({}).catch((error) => {
  console.error(error);
  process.exit(-1);
});
