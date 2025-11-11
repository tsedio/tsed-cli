import {projectInfoResource} from "../resources/projectInfoResource.js";
import {generateTool} from "./generateTool.js";
import {listTemplatesTool} from "./listTemplatesTool.js";
import {setWorkspaceTool} from "./setWorkspaceTool.js";

export default [setWorkspaceTool, projectInfoResource, listTemplatesTool, generateTool];
