import semver from "semver";

export function isValidVersion(version: string) {
  version = version.replace(/[~>=<]/gi, "");
  return !!semver.valid(version);
}
