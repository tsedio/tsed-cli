import {resolve} from "path";

export const MINIMAL_TSED_VERSION = "6";
export const DEFAULT_TSED_TAGS = "latest";
export const IGNORE_VERSIONS = ["6.0.0"];
export const IGNORE_TAGS: false | RegExp = false; // /alpha|beta/
export const TEMPLATE_DIR = resolve(__dirname, "..", "..", "templates");
