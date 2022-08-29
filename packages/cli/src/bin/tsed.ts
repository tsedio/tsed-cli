#!/usr/bin/env node
import {Cli} from "../Cli";

Cli.bootstrap({}).catch(console.error);
