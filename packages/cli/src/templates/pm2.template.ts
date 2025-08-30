import {defineTemplate} from "../utils/defineTemplate.js";
import {constant} from "@tsed/di";

defineTemplate({
  id: "pm2.node-loader",
  label: "PM2 Ecosystem for Node with loader",
  description: "Add a PM2 ecosystem file to manage your application running with node",
  type: "pm2",
  fileName: "processes.config",
  ext: "cjs",
  outputDir: ".",
  preserveCase: true,
  hidden: true,
  render() {
    return `'use strict'

const path = require('path')
const defaultLogFile = path.join(__dirname, '/logs/project-server.log')

module.exports = {
  'apps': [
    {
      name: 'api',
      'interpreter': 'node',
      interpreter_args: '--import @swc-node/register/esm-register --enable-source-maps',
      'script': \`\${process.env.WORKDIR}${constant("projectDir.srcDir")}/index.ts\`,
      'cwd': process.env.WORKDIR,
      exec_mode: 'cluster',
      instances: process.env.NODE_ENV === 'test' ? 1 : process.env.NB_INSTANCES || 2,
      autorestart: true,
      max_memory_restart: process.env.MAX_MEMORY_RESTART || '750M',
      'out_file': defaultLogFile,
      'error_file': defaultLogFile,
      'merge_logs': true,
      'kill_timeout': 30000,
    }
  ]
}
`;
  }
});

defineTemplate({
  id: "pm2.node-compiled",
  label: "PM2 Ecosystem for Node Compiled",
  description: "Add a PM2 ecosystem file to manage your application compiled with tsc",
  type: "pm2",
  fileName: "processes.config",
  ext: "cjs",
  outputDir: ".",
  preserveCase: true,
  hidden: true,
  render() {
    return `'use strict'

const path = require('path')
const defaultLogFile = path.join(__dirname, '/logs/project-server.log')

module.exports = {
  'apps': [
    {
      name: 'api',
      'script': \`\${process.env.WORKDIR}/dist/index.js\`,
      'cwd': process.env.WORKDIR,
      exec_mode: "cluster",
      instances: process.env.NODE_ENV === 'test' ? 1 : process.env.NB_INSTANCES || 2,
      autorestart: true,
      max_memory_restart: process.env.MAX_MEMORY_RESTART || '750M',
      'out_file': defaultLogFile,
      'error_file': defaultLogFile,
      'merge_logs': true,
      'kill_timeout': 30000,
    }
  ]
}`;
  }
});

defineTemplate({
  id: "pm2.bun",
  label: "PM2 Ecosystem for Bun",
  description: "Add a PM2 ecosystem file to manage your application running with Bun",
  type: "pm2",
  fileName: "processes.config",
  ext: "cjs",
  outputDir: ".",
  preserveCase: true,
  hidden: true,
  render() {
    return `'use strict'

const path = require('path')
const defaultLogFile = path.join(__dirname, '/logs/project-server.log')

module.exports = {
  'apps': [
    {
      name: 'api',
      interpreter: '~/.bun/bin/bun',
      'script': \`\${process.env.WORKDIR}/dist/index.js\`,
      'cwd': process.env.WORKDIR,
      exec_mode: 'cluster',
      instances: process.env.NODE_ENV === 'test' ? 1 : process.env.NB_INSTANCES || 2,
      autorestart: true,
      max_memory_restart: process.env.MAX_MEMORY_RESTART || '750M',
      'out_file': defaultLogFile,
      'error_file': defaultLogFile,
      'merge_logs': true,
      'kill_timeout': 30000,
    }
  ]
}`;
  }
});
