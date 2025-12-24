import {projectInfoResource} from "../resources/projectInfoResource.js";
import {generateTool} from "./generateTool.js";
import {getTemplateTool} from "./getTemplateTool.js";
import {initProjectTool} from "./initProjectTool.js";
import {listTemplatesTool} from "./listTemplatesTool.js";
import {setWorkspaceTool} from "./setWorkspaceTool.js";

export default [setWorkspaceTool, projectInfoResource, listTemplatesTool, getTemplateTool, generateTool, initProjectTool];
