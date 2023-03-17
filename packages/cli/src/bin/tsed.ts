#!/usr/bin/env node
import {Cli} from "../Cli";

Cli.bootstrap({}).catch((error) => {
  console.error(error);
  process.exit(-1);
});
