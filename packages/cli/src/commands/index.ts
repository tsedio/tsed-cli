import {AddCmd} from "./add/AddCmd.js";
import {BuildCmd} from "./build/BuildCmd.js";
import {DevCmd} from "./dev/DevCmd.js";
import {GenerateCmd} from "./generate/GenerateCmd.js";
import {InitCmd} from "./init/InitCmd.js";
import {InitOptionsCommand} from "./init/InitOptionsCmd.js";
import {McpCommand} from "./mcp/McpCommand.js";
import {RunCmd} from "./run/RunCmd.js";
import {CreateTemplateCommand} from "./template/CreateTemplateCommand.js";
import {UpdateCmd} from "./update/UpdateCmd.js";

export default [AddCmd, InitCmd, InitOptionsCommand, GenerateCmd, UpdateCmd, RunCmd, DevCmd, BuildCmd, CreateTemplateCommand, McpCommand];
