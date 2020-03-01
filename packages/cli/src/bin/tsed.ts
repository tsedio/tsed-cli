#!/usr/bin/env node
import {bootstrap} from "../index";

// WRITE SOMETHING HERE
bootstrap().then(cli => {
  cli.parseArgs();
});
