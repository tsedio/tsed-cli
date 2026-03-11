import {homedir} from "node:os";
import {basename, relative, resolve} from "node:path";

const GLOBAL_MODULE_MARKER = "/node_modules/";

function toPosixPath(pathname: string) {
  return pathname.replace(/\\/g, "/");
}

function normalizePath(pathname: string) {
  return toPosixPath(resolve(pathname));
}

function isSubPath(pathname: string, parentPath: string) {
  return pathname === parentPath || pathname.startsWith(`${parentPath}/`);
}

function splitPathAndLocation(pathname: string) {
  const match = pathname.match(/^(.*?)(:\d+(?::\d+)?)?$/);

  return {
    path: match?.[1] || pathname,
    location: match?.[2] || ""
  };
}

function getGlobalModulePath(absolutePath: string, absolutePathForCompare: string) {
  const index = absolutePathForCompare.indexOf(GLOBAL_MODULE_MARKER);

  if (index === -1) {
    return;
  }

  const pathAfterNodeModules = absolutePath.slice(index + GLOBAL_MODULE_MARKER.length);
  const segments = pathAfterNodeModules.split("/").filter(Boolean);

  if (!segments.length) {
    return;
  }

  const isScoped = segments[0].startsWith("@");
  const moduleName = isScoped ? segments.slice(0, 2).join("/") : segments[0];

  if (!moduleName || (isScoped && segments.length < 2)) {
    return;
  }

  const suffixSegments = segments.slice(isScoped ? 2 : 1);
  const suffix = suffixSegments.length ? `/${suffixSegments.join("/")}` : "";

  return `<global>/${moduleName}${suffix}`;
}

function anonymizeAbsolutePath(pathname: string, cwd: string, home: string) {
  const absolutePath = normalizePath(pathname);
  const absolutePathForCompare = absolutePath.toLowerCase();
  const cwdForCompare = cwd.toLowerCase();
  const homeForCompare = home.toLowerCase();

  if (isSubPath(absolutePathForCompare, cwdForCompare)) {
    const relativePath = toPosixPath(relative(cwd, absolutePath));

    return relativePath ? `<cwd>/${relativePath}` : "<cwd>";
  }

  const globalModulePath = getGlobalModulePath(absolutePath, absolutePathForCompare);

  if (globalModulePath) {
    return globalModulePath;
  }

  if (isSubPath(absolutePathForCompare, homeForCompare)) {
    return `~/${toPosixPath(relative(home, absolutePath))}`;
  }

  return `<external>/${basename(absolutePath)}`;
}

function anonymizeTokenWithContext(token: string, cwd: string, home: string) {
  const {path, location} = splitPathAndLocation(token);

  return `${anonymizeAbsolutePath(path, cwd, home)}${location}`;
}

function toPathFromFileUrl(token: string) {
  const decodedPath = decodeURIComponent(token.replace(/^file:\/\//, ""));

  return decodedPath.replace(/^\/([A-Za-z]:[\\/])/, "$1");
}

export function anonymizePaths(stack: string, options: {cwd?: string; home?: string} = {}) {
  const cwd = normalizePath(options.cwd || process.cwd());
  const home = normalizePath(options.home || homedir());

  return stack
    .replace(/file:\/\/\/[^\s)]+/g, (token) => anonymizeTokenWithContext(toPathFromFileUrl(token), cwd, home))
    .replace(/(^|[\s(])((?:[A-Za-z]:\\|\/)[^\s)]+)/g, (_full, prefix: string, token: string) => {
      return `${prefix}${anonymizeTokenWithContext(token, cwd, home)}`;
    });
}
